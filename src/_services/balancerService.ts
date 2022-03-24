import { ApolloClient, DefaultOptions, gql, InMemoryCache } from '@apollo/client';
import {
  LiquidityMiningPoolResult,
  LiquidityMiningTokenReward,
  Pool,
  PoolToken,
  UserPool
} from '_interfaces/balancer';
import axios from 'axios';
import { differenceInWeeks } from 'date-fns';
import { BigNumber, Contract, ethers } from 'ethers';
import { BigNumber as AdvancedBigNumber } from '@aave/protocol-js';
import { findTokenByAddress } from '_utils/index';
import { MarketDataResult } from '_services/marketDataService';
import { GenericTokenSet } from '_enums/tokens';
import { Vault__factory } from '@balancer-labs/typechain';
import { ProtocolFeeCollectorAbi } from '../_abis';
import { toUtcTime, twentyFourHoursInSecs } from '_utils/time';
import { StablePoolEncoder } from '@balancer-labs/sdk';
import { MaxUint256 } from '_utils/maths';
import { TransactionRequest, TransactionResponse } from '@ethersproject/abstract-provider';

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
    const token = findTokenByAddress(tokenSet, address);
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

function getVaultContract(signer: ethers.Signer): Contract {
  return new Contract(polygonVaultAddress, Vault__factory.abi, signer);
}
export async function getSwapApr(
  pool: Pool,
  provider: ethers.providers.Web3Provider,
  signer: ethers.Signer
): Promise<number> {
  const pastPool = await getPastPools(pool.id, provider);
  const vault: Contract = getVaultContract(signer);
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
  console.log('USPA', userPools);
  return userPools.data ? userPools.data.poolShares : [];
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
  gasPrice?: string
): Promise<TransactionResponse> {
  const vault: Contract = getVaultContract(signer);
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
  gasPrice?: string
): Promise<TransactionResponse> {
  const vault: Contract = getVaultContract(signer);
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
