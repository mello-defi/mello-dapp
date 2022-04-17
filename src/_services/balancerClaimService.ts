import axios from 'axios';
import {
  ClaimProofTuple,
  ClaimStatus,
  ComputeClaimProofPayload,
  MultiTokenCurrentRewardsEstimate,
  MultiTokenCurrentRewardsEstimateResponse,
  MultiTokenPendingClaims,
  Report,
  Snapshot,
  TokenClaimInfo,
  TokenDecimals
} from '_interfaces/balancer';
import { BigNumber, Contract, ethers } from 'ethers';
import { MerkleOrchardAbi } from '_abis/index';
import { BigNumber as AdvancedBigNumber } from '@aave/protocol-js';
import { getAddress } from 'ethers/lib/utils';
import { multicall } from '_services/walletService';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { hexToBytes, soliditySha3 } from 'web3-utils';
import { bufferToHex, keccak256, keccakFromString } from 'ethereumjs-util';
import { chunk, flatten, groupBy } from 'lodash';

async function getSnapshot(manifest: string) {
  try {
    const response = await axios.get<Snapshot>(manifest);
    return response.data || {};
  } catch (error) {
    return {};
  }
}

async function getClaimStatus(
  totalWeeks: number,
  account: string,
  tokenClaimInfo: TokenClaimInfo,
  provider: ethers.providers.Web3Provider
): Promise<ClaimStatus[]> {
  const { token, distributor, weekStart } = tokenClaimInfo;

  const claimStatusCalls = Array.from({ length: totalWeeks }).map((_, i) => [
    polygonMerkleOrchardAddress,
    'isClaimed',
    [token, distributor, weekStart + i, account]
  ]);

  const rootCalls = Array.from({ length: totalWeeks }).map((_, i) => [
    polygonMerkleOrchardAddress,
    'getDistributionRoot',
    [token, distributor, weekStart + i]
  ]);

  try {
    const result = (await multicall<boolean | string>(
      provider,
      [...claimStatusCalls, ...rootCalls],
      MerkleOrchardAbi
    )) as (boolean | string)[];

    if (result.length > 0) {
      const chunks = chunk(flatten(result), totalWeeks);

      const claimedResult = chunks[0] as boolean[];
      const distributionRootResult = chunks[1] as string[];

      return claimedResult.filter(
        (_, index) => distributionRootResult[index] !== ethers.constants.HashZero
      );
    }
  } catch (e) {
    console.log('[Claim] Claim Status Error:', e);
  }

  return [];
}

async function get<T>(hash: string, protocol = 'ipfs'): Promise<T> {
  const { data } = await axios.get(`https://cloudflare-ipfs.com/${protocol}/${hash}`);
  return data;
}

async function getReports(snapshot: Snapshot, weeks: number[]) {
  const reports = await Promise.all<Report>(
    weeks.filter((week) => snapshot[week] != null).map((week) => get(snapshot[week]))
  );
  for (const r of reports) {
    const keys = Object.keys(r);
    for (const key of keys) {
      r[key.toLowerCase()] = r[key];
      delete r[key];
    }
  }
  return Object.fromEntries(reports.map((report, i) => [weeks[i], report]));
}

function bnum(val: string | number | BigNumber): AdvancedBigNumber {
  const number = typeof val === 'string' ? val : val ? val.toString() : '0';
  return new AdvancedBigNumber(number);
}

const polygonMerkleOrchardAddress = '0x0F3e0c4218b7b0108a3643cFe9D3ec0d4F57c54e';

export async function getMultiTokensPendingClaims(
  provider: ethers.providers.Web3Provider,
  userAddress: string,
  networkId: number
): Promise<MultiTokenPendingClaims[]> {
  const url =
    'https://raw.githubusercontent.com/balancer-labs/frontend-v2/develop/src/services/claim/MultiTokenClaim.json';
  const { data } = await axios.get(url);
  const tokenClaims: TokenClaimInfo[] | undefined = data[networkId];

  const { data: data2 } = await axios.get(
    'https://raw.githubusercontent.com/balancer-labs/frontend-v2/develop/src/services/claim/TokenDecimals.json'
  );
  const tokenDecimals: TokenDecimals | undefined = data2[networkId];
  const results: MultiTokenPendingClaims[] = [];
  if (tokenClaims) {
    const vals = tokenClaims.map((tokenClaim) => ({
      ...tokenClaim,
      token: getAddress(tokenClaim.token),
      decimals:
        tokenDecimals != null && tokenDecimals[tokenClaim.token]
          ? tokenDecimals[tokenClaim.token]
          : 18
    }));
    for (const tokenClaimInfo of vals) {
      const snapshot = await getSnapshot(tokenClaimInfo.manifest);
      const weekStart = tokenClaimInfo.weekStart;
      const claimStatus = await getClaimStatus(
        Object.keys(snapshot).length,
        userAddress,
        tokenClaimInfo,
        provider
      );
      const pendingWeeks = claimStatus
        .map((status, i) => [i + weekStart, status])
        .filter(([, status]) => !status)
        .map(([i]) => i) as number[];

      const reports = await getReports(snapshot, pendingWeeks);
      const claims = Object.entries(reports)
        .filter((report: Report) => report[1][userAddress])
        .map((report: Report) => {
          return {
            id: report[0],
            amount: report[1][userAddress]
          };
        });
      const availableToClaim = claims
        .map((claim) => parseFloat(claim.amount))
        .reduce((total, amount) => total.plus(amount), bnum(0))
        .toString();
      results.push({
        claims,
        reports,
        tokenClaimInfo,
        availableToClaim
      });
    }
  }
  console.log('[Claim] MultiTokensPendingClaims', results);
  return results.filter((claim) => claim.claims.length > 0 || claim.availableToClaim !== '0');
}

export async function getMultiTokensCurrentRewardsEstimate(
  userAddress: string,
  networkId: number
): Promise<{
  data: MultiTokenCurrentRewardsEstimate[];
  timestamp: string | null;
}> {
  try {
    const response = await axios.get<MultiTokenCurrentRewardsEstimateResponse>(
      `https://api.balancer.finance/liquidity-mining/v1/liquidity-provider-multitoken/${userAddress}`
    );
    if (response.data.success) {
      const multiTokenLiquidityProviders = response.data.result['liquidity-providers']
        .filter((incentive) => incentive.chain_id === networkId)
        .map((incentive) => ({
          ...incentive,
          token_address: getAddress(incentive.token_address)
        }));

      const multiTokenCurrentRewardsEstimate: MultiTokenCurrentRewardsEstimate[] = [];

      const multiTokenLiquidityProvidersByToken = Object.entries(
        groupBy(multiTokenLiquidityProviders, 'token_address')
      );

      for (const [token, liquidityProvider] of multiTokenLiquidityProvidersByToken) {
        const rewards = liquidityProvider
          .reduce((total, { current_estimate }) => total.plus(current_estimate), bnum(0))
          .toString();

        const velocity =
          liquidityProvider
            .find((liquidityProvider) => Number(liquidityProvider.velocity) > 0)
            ?.velocity.toString() ?? '0';

        if (Number(rewards) > 0) {
          multiTokenCurrentRewardsEstimate.push({
            rewards,
            velocity,
            token: getAddress(token)
          });
        }
      }

      return {
        data: multiTokenCurrentRewardsEstimate,
        timestamp: response.data.result.current_timestamp
      };
    }
  } catch (e) {
    console.log('[Claim] Current Rewards Estimate Error', e);
  }
  return {
    data: [],
    timestamp: null
  };
}
export function scale(input: AdvancedBigNumber | string, decimalPlaces: number): AdvancedBigNumber {
  const unscaled = typeof input === 'string' ? new AdvancedBigNumber(input) : input;
  const scalePow = new AdvancedBigNumber(decimalPlaces.toString());
  const scaleMul = new AdvancedBigNumber(10).pow(scalePow);
  return unscaled.times(scaleMul);
}

export class MerkleTree {
  public elements: any;
  public layers: any;

  constructor(elements: any) {
    this.elements = elements.filter((el: any) => el).map((el: any) => Buffer.from(hexToBytes(el)));

    // console.log('elements', this.elements);
    // Sort elements
    this.elements.sort(Buffer.compare);
    // Deduplicate elements
    this.elements = this.bufDedup(this.elements);

    // Create layers
    this.layers = this.getLayers(this.elements);
  }

  getRoot() {
    return this.layers[this.layers.length - 1][0];
  }

  getHexRoot() {
    return bufferToHex(this.getRoot());
  }

  bufDedup(elements: any) {
    return elements.filter((el: any, idx: number) => {
      return idx === 0 || !elements[idx - 1].equals(el);
    });
  }

  getLayers(elements: any) {
    if (elements.length === 0) {
      return [['']];
    }

    const layers = [];
    layers.push(elements);

    // Get next layer until we reach the root
    while (layers[layers.length - 1].length > 1) {
      layers.push(this.getNextLayer(layers[layers.length - 1]));
    }

    return layers;
  }

  // external call - convert to buffer
  getHexProof(_el: any) {
    const el = Buffer.from(hexToBytes(_el));
    const proof = this.getProof(el);
    return this.bufArrToHexArr(proof);
  }
  bufIndexOf(el: any, arr: any) {
    let hash;

    // Convert element to 32 byte hash if it is not one already
    if (el.length !== 32 || !Buffer.isBuffer(el)) {
      hash = keccakFromString(el);
    } else {
      hash = el;
    }

    for (let i = 0; i < arr.length; i++) {
      if (hash.equals(arr[i])) {
        return i;
      }
    }

    return -1;
  }

  getProof(el: any) {
    let idx = this.bufIndexOf(el, this.elements);
    if (idx === -1) {
      throw new Error('Element does not exist in Merkle tree');
    }

    return this.layers.reduce((proof: any, layer: any) => {
      const pairElement = this.getPairElement(idx, layer);
      if (pairElement) {
        proof.push(pairElement);
      }

      idx = Math.floor(idx / 2);

      return proof;
    }, []);
  }

  getNextLayer(elements: any[]) {
    return elements.reduce((layer, el, idx, arr) => {
      if (idx % 2 === 0) {
        // Hash the current element with its pair element
        layer.push(this.combinedHash(el, arr[idx + 1]));
      }

      return layer;
    }, []);
  }
  sortAndConcat(...args: any[]) {
    return Buffer.concat([...args].sort(Buffer.compare));
  }

  combinedHash(first: any, second: any) {
    if (!first) {
      return second;
    }
    if (!second) {
      return first;
    }

    return keccak256(this.sortAndConcat(first, second));
  }

  getPairElement(idx: number, layer: any) {
    const pairIdx = idx % 2 === 0 ? idx + 1 : idx - 1;
    if (pairIdx < layer.length) {
      return layer[pairIdx];
    } else {
      return null;
    }
  }

  bufArrToHexArr(arr: any) {
    if (arr.some((el: any) => !Buffer.isBuffer(el))) {
      throw new Error('Array is not an array of buffers');
    }

    return arr.map((el: any) => '0x' + el.toString('hex'));
  }
}

export function loadTree(balances: any, decimals: number) {
  const elements: any[] = [];
  Object.keys(balances).forEach((address) => {
    const balance: string = scale(balances[address], decimals).toString(10);
    const leaf = soliditySha3({ t: 'address', v: address }, { t: 'uint', v: balance });
    elements.push(leaf);
  });
  return new MerkleTree(elements);
}

function computeClaimProof(payload: ComputeClaimProofPayload): ClaimProofTuple {
  const { report, account, claim, distributor, tokenIndex, decimals } = payload;

  const claimAmount = claim.amount;
  const merkleTree = loadTree(report, decimals);

  const scaledBalance = scale(claimAmount, decimals).toString(10);
  const proof = merkleTree.getHexProof(
    soliditySha3({ t: 'address', v: account }, { t: 'uint', v: scaledBalance })
  ) as string[];

  return [parseInt(claim.id), scaledBalance, distributor, tokenIndex, proof];
}

async function computeClaimProofs(
  tokenPendingClaims: MultiTokenPendingClaims,
  account: string,
  tokenIndex: number
): Promise<Promise<ClaimProofTuple[]>> {
  return Promise.all(
    tokenPendingClaims.claims.map((claim) => {
      const payload: ComputeClaimProofPayload = {
        account,
        distributor: tokenPendingClaims.tokenClaimInfo.distributor,
        tokenIndex,
        decimals: tokenPendingClaims.tokenClaimInfo.decimals,
        // objects must be cloned
        report: { ...tokenPendingClaims.reports[claim.id] },
        claim: { ...claim }
      };
      console.log('computeClaimProofs', payload);
      return computeClaimProof(payload);
    })
  );
}

export async function multiTokenClaimRewards(
  signer: ethers.Signer,
  multiTokenPendingClaims: MultiTokenPendingClaims[],
  userAddress: string
): Promise<TransactionResponse> {
  const tokens = multiTokenPendingClaims.map(
    (tokenPendingClaims) => tokenPendingClaims.tokenClaimInfo.token
  );
  const multiTokenClaims = await Promise.all(
    multiTokenPendingClaims.map((tokenPendingClaims, tokenIndex) =>
      computeClaimProofs(tokenPendingClaims, getAddress(userAddress), tokenIndex)
    )
  );
  const contract = new Contract(polygonMerkleOrchardAddress, MerkleOrchardAbi, signer);
  console.log('flattened', flatten(multiTokenClaims));
  console.log('tokens', tokens);
  return await contract
    .connect(signer)
    .claimDistributions(getAddress(userAddress), flatten(multiTokenClaims), tokens);
}
