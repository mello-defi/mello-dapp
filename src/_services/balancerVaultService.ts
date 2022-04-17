import {
  LinearPoolDataMap,
  OnchainPoolData,
  OnchainTokenDataMap,
  Pool,
  RawLinearPoolData,
  RawLinearPoolDataMap,
  RawOnchainPoolData,
  RawPoolTokens,
  TokenInfoMap
} from '_interfaces/balancer';
import { formatUnits, getAddress } from 'ethers/lib/utils';
import { BigNumber, Contract, ethers } from 'ethers';
import { multicall, multicallToObject } from '_services/walletService';
import { isStable, isWeighted } from '_services/balancerCalculatorService';
import {
  StablePool__factory,
  Vault__factory,
  WeightedPool__factory
} from '@balancer-labs/typechain';
import { PoolType } from '_enums/balancer';
import { Zero, WeiPerEther as ONE } from '@ethersproject/constants';
import { pick } from 'lodash';

const polygonVaultAddress = '0xBA12222222228d8Ba445958a75a0704d566BF2C8';

export function getVaultAddress(chainId: number): string {
  return polygonVaultAddress;
}
export function getWriteVaultContract(signer: ethers.Signer): Contract {
  return new Contract(polygonVaultAddress, Vault__factory.abi, signer);
}
export function getReadVaultContract(provider: ethers.providers.Web3Provider): Contract {
  return new Contract(polygonVaultAddress, Vault__factory.abi, provider);
}
const MaxWeightedTokens = 100;

/**
 * Normalize an array of token weights to ensure they sum to `1e18`
 * @param weights - an array of token weights to be normalized
 * @returns an equivalent set of normalized weights
 */
export function toNormalizedWeights(weights: BigNumber[]): BigNumber[] {
  // When the number is exactly equal to the max, normalizing with common inputs
  // leads to a value < 0.01, which reverts. In this case fill in the weights exactly.
  if (weights.length == MaxWeightedTokens) {
    return Array(MaxWeightedTokens).fill(ONE.div(MaxWeightedTokens));
  }

  const sum = weights.reduce((total, weight) => total.add(weight), Zero);
  if (sum.eq(ONE)) return weights;

  const normalizedWeights = [];
  let normalizedSum = Zero;
  for (let index = 0; index < weights.length; index++) {
    if (index < weights.length - 1) {
      normalizedWeights[index] = weights[index].mul(ONE).div(sum);
      normalizedSum = normalizedSum.add(normalizedWeights[index]);
    } else {
      normalizedWeights[index] = ONE.sub(normalizedSum);
    }
  }

  return normalizedWeights;
}

function normalizeWeights(weights: BigNumber[], type: PoolType, tokens: TokenInfoMap): number[] {
  if (isWeighted(type)) {
    return toNormalizedWeights(weights).map((w) => Number(formatUnits(w, 18)));
  } else if (isStable(type)) {
    const tokensList = Object.values(tokens);
    return tokensList.map(() => 1 / tokensList.length);
  } else {
    return [];
  }
}

function formatPoolTokens(
  poolTokens: RawPoolTokens,
  tokenInfo: TokenInfoMap,
  weights: number[],
  poolAddress: string
): OnchainTokenDataMap {
  const tokens = <OnchainTokenDataMap>{};

  poolTokens.tokens.forEach((token, i) => {
    const tokenBalance = poolTokens.balances[i];
    const tokenAddressLowercase = token.toLowerCase();
    const decimals = tokenInfo[tokenAddressLowercase]?.decimals;
    tokens[tokenAddressLowercase] = {
      decimals,
      balance: formatUnits(tokenBalance, decimals),
      weight: weights[i],
      // @ts-ignore
      symbol: tokenInfo[tokenAddressLowercase]?.symbol,
      name: tokenInfo[tokenAddressLowercase]?.name,
      logoURI: undefined
    };
  });

  // Remove pre-minted BPT
  delete tokens[poolAddress];

  return tokens;
}

function formatLinearPools(linearPools: RawLinearPoolDataMap): LinearPoolDataMap {
  const _linearPools = <LinearPoolDataMap>{};

  Object.keys(linearPools).forEach((address) => {
    const {
      id,
      mainToken,
      wrappedToken,
      priceRate,
      unwrappedTokenAddress,
      tokenData,
      totalSupply
    } = linearPools[address];

    _linearPools[address] = {
      id,
      priceRate: formatUnits(priceRate.toString(), 18),
      mainToken: {
        address: getAddress(mainToken.address),
        index: mainToken.index.toNumber(),
        balance: tokenData.balances[mainToken.index.toNumber()].toString()
      },
      wrappedToken: {
        address: getAddress(wrappedToken.address),
        index: wrappedToken.index.toNumber(),
        balance: tokenData.balances[wrappedToken.index.toNumber()].toString(),
        priceRate: formatUnits(wrappedToken.rate, 18)
      },
      unwrappedTokenAddress: getAddress(unwrappedTokenAddress),
      totalSupply: formatUnits(totalSupply, 18)
    };
  });

  return _linearPools;
}

function formatPoolData(
  rawData: RawOnchainPoolData,
  type: PoolType,
  tokens: TokenInfoMap,
  poolAddress: string
): OnchainPoolData {
  const poolData = <OnchainPoolData>{};

  // Filter out pre-minted BPT token if exists
  const validTokens = Object.keys(tokens).filter((address) => address !== poolAddress);
  tokens = pick(tokens, validTokens);

  const normalizedWeights = normalizeWeights(rawData?.weights || [], type, tokens);

  poolData.tokens = formatPoolTokens(rawData.poolTokens, tokens, normalizedWeights, poolAddress);

  poolData.amp = '0';
  if (rawData?.amp) {
    poolData.amp = rawData.amp.value.div(rawData.amp.precision).toString();
  }

  poolData.swapEnabled = true;
  if (rawData.swapEnabled !== undefined) {
    poolData.swapEnabled = rawData.swapEnabled;
  }

  if (rawData?.linearPools) {
    poolData.linearPools = formatLinearPools(rawData.linearPools);
  }

  if (rawData.tokenRates) {
    poolData.tokenRates = rawData.tokenRates.map((rate) => formatUnits(rate.toString(), 18));
  }

  poolData.totalSupply = formatUnits(rawData.totalSupply, rawData.decimals);
  poolData.decimals = rawData.decimals;
  poolData.swapFee = formatUnits(rawData.swapFee, 18);

  return poolData;
}

function getAbiForPoolType(poolType: PoolType) {
  switch (poolType) {
    case PoolType.Stable:
      return StablePool__factory.abi;
    case PoolType.Weighted:
      return WeightedPool__factory.abi;
    default:
      throw new Error(`Unsupported pool type: ${poolType}`);
  }
}

export async function getPoolOnChainData(
  pool: Pool,
  provider: ethers.providers.Web3Provider
): Promise<OnchainPoolData> {
  let paths: string[] = ['totalSupply', 'decimals', 'swapFee'];
  let calls: any[] = [
    // totalSupply
    [pool.address, 'totalSupply', []],
    // decimals
    [pool.address, 'decimals', []],
    // swapFee
    [pool.address, 'getSwapFeePercentage', []]
  ];

  if (isWeighted(pool.poolType)) {
    paths.push('weights');
    calls.push([pool.address, 'getNormalizedWeights', []]);
  } else if (isStable(pool.poolType)) {
    paths.push('amp');
    calls.push([pool.address, 'getAmplificationParameter', []]);
  }

  let result: RawOnchainPoolData = await multicallToObject(
    provider,
    paths,
    calls,
    getAbiForPoolType(pool.poolType)
  );
  paths = [];
  calls = [];
  if (isStable(pool.poolType) && result.linearPools) {
    const wrappedTokensMap: Record<string, string> = {};

    Object.keys(result.linearPools).forEach((address) => {
      if (!result.linearPools) return;
      const linearPool: RawLinearPoolData = result.linearPools[address];

      paths.push(`linearPools.${address}.tokenData`);
      calls.push([pool.address, 'getPoolTokens', [linearPool.id]]);

      wrappedTokensMap[address] = linearPool.wrappedToken.address;
    });

    Object.entries(wrappedTokensMap).forEach(([address, wrappedToken]) => {
      paths.push(`linearPools.${address}.unwrappedTokenAddress`);
      calls.push([wrappedToken, 'ATOKEN', []]);
      paths.push(`linearPools.${address}.totalSupply`);
      calls.push([address, 'getVirtualSupply', []]);
    });
    const result2 = await multicallToObject(
      provider,
      paths,
      calls,
      getAbiForPoolType(pool.poolType)
    );
    result = {
      ...result,
      ...result2
    };
  }

  const vaultContract = getReadVaultContract(provider);
  const pt: RawPoolTokens = await vaultContract.getPoolTokens(pool.id);
  result = {
    ...result,
    poolTokens: pt
  };

  const tokens: TokenInfoMap = {};
  for (const token of pool.tokens) {
    tokens[token.address.toLowerCase()] = {
      ...token,
      chainId: 137
    };
  }
  return formatPoolData(result, pool.poolType, tokens, pool.address);
}
