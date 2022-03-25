import { ApolloClient, DefaultOptions, gql, InMemoryCache } from '@apollo/client';
import {
  LiquidityMiningPoolResult,
  LiquidityMiningTokenReward,
  OnchainPoolData,
  Pool,
  PoolToken,
  PoolType,
  RawLinearPoolData,
  RawOnchainPoolData,
  UserPool
} from '_interfaces/balancer';
import axios from 'axios';
import { differenceInWeeks } from 'date-fns';
import { BigNumber, Contract, ethers } from 'ethers';
import { BigNumber as AdvancedBigNumber } from '@aave/protocol-js';
import { getTokenByAddress } from '_utils/index';
import { MarketDataResult } from '_services/marketDataService';
import { GenericTokenSet } from '_enums/tokens';
import {
  InvestmentPool__factory,
  LiquidityBootstrappingPool__factory,
  MetaStablePool__factory,
  StablePool__factory,
  Vault__factory,
  WeightedPool__factory
} from '@balancer-labs/typechain';
import { ERC20Abi, ProtocolFeeCollectorAbi } from '../_abis';
import { toUtcTime, twentyFourHoursInSecs } from '_utils/time';
import { StablePoolEncoder, toNormalizedWeights } from '@balancer-labs/sdk';
import { MaxUint256 } from '_utils/maths';
import { TransactionRequest, TransactionResponse } from '@ethersproject/abstract-provider';
import { WalletTokenBalances } from '_redux/types/walletTypes';
import { multicall } from '_services/walletService';

const liquidityMiningStartTime = Date.UTC(2020, 5, 1, 0, 0);
const polygonVaultAddress = '0xBA12222222228d8Ba445958a75a0704d566BF2C8';

const GET_USER_POOLS = gql`
  query getUserPools($userAddress: String!) {
    poolShares(where: { userAddress: $userAddress }) {
      id
      poolId {
        id
        address
        poolType
        totalLiquidity
        strategyType
        totalSwapFee
        swapFee
        symbol
        amp
        tokens {
          id
          symbol
          name
          decimals
          address
          balance
          invested
          investments {
            id
            amount
          }
          weight
        }
      }
      balance
    }
  }
`;

const GET_PAST_POOL_FOR_ID = gql`
  query GetPools($block: Int!, $poolId: String!) {
    pools(where: { id: $poolId }, block: { number: $block }) {
      id
      address
      poolType
      totalLiquidity
      strategyType
      totalSwapFee
      swapFee
      symbol
      amp
      tokens {
        id
        symbol
        name
        decimals
        address
        balance
        invested
        investments {
          id
          amount
        }
        weight
      }
    }
  }
`;
const GET_ALL_POOLS = gql`
  query GetPools {
    pools(first: 5, skip: 0, orderBy: totalLiquidity, orderDirection: desc) {
      id
      address
      poolType
      totalLiquidity
      strategyType
      totalSwapFee
      swapFee
      symbol
      amp
      tokens {
        id
        symbol
        name
        decimals
        address
        balance
        invested
        investments {
          id
          amount
        }
        weight
      }
    }
  }
`;

const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'ignore'
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all'
  }
};
const client = new ApolloClient({
  // REVIEW make network specific
  uri: 'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-polygon-v2',
  cache: new InMemoryCache({ resultCaching: false }),
  defaultOptions
});

function getCurrentLiquidityMiningWeek() {
  return differenceInWeeks(toUtcTime(new Date()), liquidityMiningStartTime) + 1;
}

function bnum(val: string | number | BigNumber): AdvancedBigNumber {
  const number = typeof val === 'string' ? val : val ? val.toString() : '0';
  return new AdvancedBigNumber(number);
}

const getPriceForAddress = (
  tokenSet: GenericTokenSet,
  prices: MarketDataResult[],
  address: string
): number => {
  try {
    const token = getTokenByAddress(tokenSet, address);
    const p = prices.find(
      (p: MarketDataResult) => p.symbol.toLowerCase() === token.symbol.toLowerCase()
    );
    return p ? p.current_price : 0;
  } catch (e: any) {
    console.log(e);
  }
  return 0;
};

function computeAPRForPool(
  rewards: number,
  tokenPrice: number | null | undefined,
  totalLiquidity: string
) {
  // Guard against null price
  if (tokenPrice === null || tokenPrice === undefined) return '0';
  return bnum(rewards).div(7).times(tokenPrice).times(365).div(totalLiquidity).toString();
}

function computeTotalAPRForPool(
  tokenRewards: LiquidityMiningTokenReward[],
  totalLiquidity: string,
  marketPrices: MarketDataResult[],
  tokenSet: GenericTokenSet
) {
  return tokenRewards
    .reduce(
      (totalRewards: AdvancedBigNumber, { amount, tokenAddress }) =>
        totalRewards.plus(
          computeAPRForPool(
            amount,
            getPriceForAddress(tokenSet, marketPrices, tokenAddress),
            totalLiquidity
          )
        ),
      bnum(0)
    )
    .toString();
}

const getBlockNum = async (provider: ethers.providers.Web3Provider): Promise<number> => {
  const currentBlock = await provider.getBlockNumber();
  const blocksInDay = Math.round(twentyFourHoursInSecs / 2);
  return currentBlock - blocksInDay;
};

const getPastPools = async (
  poolId: string,
  provider: ethers.providers.Web3Provider
): Promise<Pool> => {
  const blockNum = await getBlockNum(provider);
  const poolResults = await client.query({
    query: GET_PAST_POOL_FOR_ID,
    variables: { block: blockNum, poolId }
  });
  return poolResults.data ? poolResults.data.pools[0] : null;
};

function getReadVaultContract(provider: ethers.providers.Web3Provider): Contract {
  return new Contract(polygonVaultAddress, Vault__factory.abi, provider);
}

function getWriteVaultContract(signer: ethers.Signer): Contract {
  return new Contract(polygonVaultAddress, Vault__factory.abi, signer);
}
export async function getSwapApr(
  pool: Pool,
  provider: ethers.providers.Web3Provider,
  signer: ethers.Signer
): Promise<number> {
  const pastPool = await getPastPools(pool.id, provider);
  const vault: Contract = getWriteVaultContract(signer);
  const collectorAddress = await vault.getProtocolFeesCollector();
  const collector = new Contract(collectorAddress, ProtocolFeeCollectorAbi, signer);
  const swapFeePercentage = await collector.getSwapFeePercentage();
  const protocolFeePercentage = swapFeePercentage / 10 ** 18;
  let poolApr: AdvancedBigNumber | string = '';
  if (!pastPool) {
    poolApr = bnum(pool.totalSwapFee)
      .times(1 - protocolFeePercentage)
      .dividedBy(pool.totalLiquidity)
      .multipliedBy(365);
  } else {
    const swapFees = bnum(pool.totalSwapFee).minus(pastPool.totalSwapFee);
    poolApr = swapFees
      .times(1 - protocolFeePercentage)
      .dividedBy(pool.totalLiquidity)
      .multipliedBy(365);
  }
  return Number(poolApr.times(100).toFixed(2));
}

export async function getMiningLiquidityApr(
  tokenSet: GenericTokenSet,
  pool: Pool,
  marketPrices: MarketDataResult[]
): Promise<number> {
  let liquidityMiningAPR = '0';
  const url =
    'https://raw.githubusercontent.com/balancer-labs/frontend-v2/develop/src/lib/utils/liquidityMining/MultiTokenLiquidityMining.json';
  const { data } = await axios.get(url);
  const week = `week_${getCurrentLiquidityMiningWeek()}`;
  const weekStats: LiquidityMiningPoolResult[] | undefined = data[week];
  let liquidityMiningRewards: LiquidityMiningTokenReward[] = [];

  if (weekStats) {
    const rewards = weekStats.find((p: LiquidityMiningPoolResult) => p.chainId === 137)?.pools;
    if (rewards && rewards[pool.id]) {
      liquidityMiningRewards = rewards[pool.id];
    }
  }

  const miningTotalLiquidity = bnum(pool.totalLiquidity).toString();
  const IS_LIQUIDITY_MINING_ENABLED = true;
  const hasLiquidityMiningRewards = IS_LIQUIDITY_MINING_ENABLED
    ? !!liquidityMiningRewards.length
    : false;
  if (hasLiquidityMiningRewards) {
    liquidityMiningAPR = computeTotalAPRForPool(
      liquidityMiningRewards,
      miningTotalLiquidity,
      marketPrices,
      tokenSet
    );
  }
  return Number(bnum(liquidityMiningAPR).times(100).toFixed(2));
}

export async function getUserPools(userAddress: string): Promise<UserPool[]> {
  const userPools = await client.query({
    query: GET_USER_POOLS,
    variables: { userAddress: userAddress.toLowerCase() }
  });
  return userPools.data ? userPools.data.poolShares : [];
}

export function getVaultAddress(chainId: number): string {
  return polygonVaultAddress;
}

export async function getPools(addresses: string[]): Promise<Pool[]> {
  const poolResults = await client.query({
    query: GET_ALL_POOLS
  });
  const allowedPools: Pool[] = [];
  const lowercaseAddresses = addresses.map((address) => address.toLowerCase());
  for (const pool of poolResults.data.pools) {
    const matchingTokens = pool.tokens.filter((t: PoolToken) =>
      lowercaseAddresses.includes(t.address.toLowerCase())
    );
    if (matchingTokens.length === pool.tokens.length) {
      allowedPools.push(pool as Pool);
    }
  }
  return allowedPools;
}

export async function joinPool(
  pool: Pool,
  userAddress: string,
  signer: ethers.Signer,
  amountsIn: string[],
  gasPrice?: BigNumber
): Promise<TransactionResponse> {
  const vault: Contract = getWriteVaultContract(signer);
  const options: TransactionRequest = {};
  if (gasPrice) {
    options.gasPrice = gasPrice.toString();
  }

  return await vault.joinPool(
    pool.id,
    userAddress,
    userAddress,
    {
      assets: pool.tokens.map((t: PoolToken) => t.address),
      maxAmountsIn: amountsIn,
      fromInternalBalance: false,
      userData: StablePoolEncoder.joinExactTokensInForBPTOut(amountsIn, BigNumber.from('0'))
    },
    options
  );
}

export async function exitPool(
  pool: Pool,
  userAddress: string,
  signer: ethers.Signer,
  amountsOut: string[],
  gasPrice?: BigNumber
): Promise<TransactionResponse> {
  const vault: Contract = getWriteVaultContract(signer);
  const options: TransactionRequest = {};
  if (gasPrice) {
    options.gasPrice = gasPrice.toString();
  }
  return await vault.exitPool(
    pool.id,
    userAddress,
    userAddress,
    {
      assets: pool.tokens.map((t: PoolToken) => t.address),
      minAmountsOut: amountsOut,
      fromInternalBalance: false,
      userData: StablePoolEncoder.exitBPTInForExactTokensOut(amountsOut, MaxUint256)
    },
    options
  );
}

function getAbiForPoolType(poolType: PoolType) {
  switch (poolType) {
    case PoolType.Investment:
      return InvestmentPool__factory.abi;
    case PoolType.Stable:
      return StablePool__factory.abi;
    case PoolType.LiquidityBootstrapping:
      return LiquidityBootstrappingPool__factory.abi;
    case PoolType.MetaStable:
      return MetaStablePool__factory.abi;
    case PoolType.Weighted:
      return WeightedPool__factory.abi;
    case PoolType.StablePhantom:
      return StablePool__factory.abi;
    default:
      return null;
  }
}

export function isStable(poolType: PoolType): boolean {
  return poolType === PoolType.Stable;
}

export function isMetaStable(poolType: PoolType): boolean {
  return poolType === PoolType.MetaStable;
}

export function isStablePhantom(poolType: PoolType): boolean {
  return poolType === PoolType.StablePhantom;
}

export function isStableLike(poolType: PoolType): boolean {
  return isStable(poolType) || isMetaStable(poolType) || isStablePhantom(poolType);
}

export function isLiquidityBootstrapping(poolType: PoolType): boolean {
  return poolType === PoolType.LiquidityBootstrapping;
}

export function isWeighted(poolType: PoolType): boolean {
  return poolType === PoolType.Weighted;
}

export function isManaged(poolType: PoolType): boolean {
  // Correct terminology is managed pools but subgraph still returns poolType = "Investment"
  return poolType === PoolType.Investment;
}

export function isWeightedLike(poolType: PoolType): boolean {
  return isWeighted(poolType) || isManaged(poolType) || isLiquidityBootstrapping(poolType);
}

export function isTradingHaltable(poolType: PoolType): boolean {
  return isManaged(poolType) || isLiquidityBootstrapping(poolType);
}

function normalizeWeights(weights: BigNumber[], type: PoolType, tokens: PoolToken[]): number[] {
  if (isWeightedLike(type)) {
    // toNormalizedWeights returns weights as 18 decimal fixed point
    return toNormalizedWeights(weights).map((w) => Number(ethers.utils.formatUnits(w, 18)));
  } else if (isStableLike(type)) {
    // const tokensList = Object.values(tokens);
    return tokens.map(() => 1 / tokens.length);
  } else {
    return [];
  }
}

export async function getPoolOnChainData(pool: Pool, provider: ethers.providers.Web3Provider) {
  const paths: string[] = ['totalSupply', 'decimals', 'swapFee']
  const calls: any[] = [
    // totalSupply
    [pool.address, 'totalSupply', []],
    // decimals
    [pool.address, 'decimals', []],
    // swapFee
    [pool.address, 'getSwapFeePercentage', []]
  ];

  if (isWeightedLike(pool.poolType)) {
    paths.push('weights');
    calls.push([pool.address, 'getNormalizedWeights', []]);

    if (isTradingHaltable(pool.poolType)) {
      paths.push('swapEnabled');
      calls.push([pool.address, 'getSwapEnabled', []]);
    }
  } else if (isStableLike(pool.poolType)) {
    paths.push('amp');
    calls.push([pool.address, 'getAmplificationParameter', []]);

    if (isStablePhantom(pool.poolType)) {
      // Overwrite totalSupply with virtualSupply for StablePhantom pools
      // totalSupply
      paths.push('totalSupply');
      calls.push([pool.address, 'getVirtualSupply', []]);

      pool.tokens
        .map((t) => t.address.toLowerCase())
        .forEach((token, i) => {
          paths.push(`linearPools.${token}.id`);
          calls.push([token, 'getPoolId']);

          paths.push(`linearPools.${token}.priceRate`)
          calls.push([token, 'getRate', []]);

          paths.push(`tokenRates[${i}]`)
          calls.push([pool.address, 'getTokenRate', [token]]);

          paths.push(`linearPools.${token}.mainToken.address`)
          calls.push([token, 'getMainToken', [token]]);

          paths.push(`linearPools.${token}.mainToken.index`)
          calls.push([token, 'getMainIndex', []]);

          paths.push(`linearPools.${token}.wrappedToken.address`)
          calls.push([token, 'getWrappedToken', []]);

          paths.push(`linearPools.${token}.wrappedToken.index`)
          calls.push([token, 'getWrappedIndex', []]);

          paths.push(`linearPools.${token}.wrappedToken.rate`)
          calls.push([token, 'getWrappedTokenRate', []]);

        });
    }
  }

  const poolMulticallResult = await multicall(provider,paths, calls, getAbiForPoolType(pool.poolType));
  console.log(poolMulticallResult);
  // // const onChainData: OnchainPoolData = {};
  // poolMulticallResult.forEach(([success, result], i) => {
  //   if (success && result) {
  //     console.log(`${calls[i][1]} = ${result}`);
  //   }
  // });

  // let result = <RawOnchainPoolData>{};

  // if (isStablePhantom(pool.poolType) && result.linearPools) {
  //   const wrappedTokensMap: Record<string, string> = {};
  //
  //   Object.keys(result.linearPools).forEach(address => {
  //     if (!result.linearPools) return;
  //     const linearPool: RawLinearPoolData = result.linearPools[address];
  //
  //     vaultMultiCaller.call(
  //       `linearPools.${address}.tokenData`,
  //       this.address,
  //       'getPoolTokens',
  //       [linearPool.id]
  //     );
  //
  //     wrappedTokensMap[address] = linearPool.wrappedToken.address;
  //   });
  //
  //   Object.entries(wrappedTokensMap).forEach(([address, wrappedToken]) => {
  //     calls.push(
  //       [
  //       wrappedToken,
  //       'ATOKEN',[]
  //         ]
  //     );
  //     calls.push([
  //       address,
  //       'getVirtualSupply',
  //       []]
  //     );
  //   });
  //
  //   result = await poolMulticaller.execute(result);
  // }

  // vaultMultiCaller.call('poolTokens', this.address, 'getPoolTokens', [id]);
  // result = await vaultMultiCaller.execute(result);

  // const walletBalances: WalletTokenBalances = {};
  // res.forEach(([success, result], i) => {
  //   if (success && result) {
  //     const symbol = getTokenByAddress(tokenSet, calls[i][0]).symbol;
  //     walletBalances[symbol] = {
  //       balance: result.length > 1 ? result : result[0]
  //     }
  //   }
  // });
  // // const vaultContract = getReadVaultContract(provider);
  // const poolTokens = await vaultContract.getPoolTokens(pool.id);

  // const poolContract = new Contract(pool.address, StablePool__factory.abi, provider);
  // const supply = await poolContract.totalSupply();
  // const decimals = await poolContract.decimals();
  // const swapFee = await poolContract.getSwapFeePercentage();
  // const tokens = await vaultContract.getPoolTokens(pool.id);
  // console.log('supply', supply);
  // console.log('decimals', decimals);
  // console.log('swapFee', swapFee);
  // console.log('tokens', tokens);
}
