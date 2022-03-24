import { ApolloClient, DefaultOptions, gql, InMemoryCache } from '@apollo/client';
import {
  LiquidityMiningPoolResult,
  LiquidityMiningTokenRewards,
  Pool,
  PoolToken,
  PoolType
} from '_interfaces/balancer';
import axios from 'axios';
import { differenceInWeeks } from 'date-fns';
import { BigNumber } from 'ethers';
import { BigNumber as AaveBigNumber } from '@aave/protocol-js';
import { findTokenByAddress } from '_utils/index';
import { MarketDataResult } from '_services/marketDataService';
import { getAddress } from 'ethers/lib/utils';
import { GenericTokenSet } from '_enums/tokens';

const GET_POOLS = gql`
  query GetPools {
    pools(first: 1000, skip: 0, orderBy: totalLiquidity, orderDirection: desc) {
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

function toUtcTime(date: Date) {
  return Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  );
}

const liquidityMiningStartTime = Date.UTC(2020, 5, 1, 0, 0);

function getCurrentLiquidityMiningWeek() {
  return differenceInWeeks(toUtcTime(new Date()), liquidityMiningStartTime) + 1;
}

function bnum(val: string | number | BigNumber): AaveBigNumber {
  const number = typeof val === 'string' ? val : val ? val.toString() : '0';
  return new AaveBigNumber(number);
}

function removeAddressesFromTotalLiquidity(
  // excludedAddresses: ExcludedAddresses,
  pool: any,
  totalLiquidityString: string
) {
  const totalLiquidity = bnum(totalLiquidityString);
  const miningTotalLiquidity = totalLiquidity;
  //
  // if (excludedAddresses != null && excludedAddresses[pool.address] != null) {
  //   Object.values(excludedAddresses[pool.address]).forEach(accountBalance => {
  //     const accountBalanceFormatted = formatUnits(accountBalance, 18);
  //     const poolShare = bnum(accountBalanceFormatted).div(pool.totalShares);
  //
  //     miningTotalLiquidity = miningTotalLiquidity.minus(
  //       totalLiquidity.times(poolShare)
  //     );
  //   });
  // }

  return miningTotalLiquidity.toString();
}

const removeExcludedAddressesFromTotalLiquidity = (pool: any, totalLiquidityString: string) => {
  return removeAddressesFromTotalLiquidity(pool, totalLiquidityString);
};
const getPriceForAddress = (tokenSet: GenericTokenSet, prices: MarketDataResult[], address: string): number => {
  try {
    const token = findTokenByAddress(tokenSet, address);
    const p = prices.find((p: MarketDataResult) => p.symbol.toLowerCase() === token.symbol.toLowerCase());
    return p ? p.current_price: 0;
  } catch (e: any) {
    // console.lo
  }
  return 0;
}

function computeAPRForPool(
  rewards: number,
  tokenPrice: number | null | undefined,
  totalLiquidity: string
) {
  // Guard against null price
  if (tokenPrice === null || tokenPrice === undefined) return '0';
  // console.log('calculating aprfor pool')
  // console.log(rewards)
  // console.log(tokenPrice)
  // console.log(totalLiquidity)

  return bnum(rewards).div(7).times(tokenPrice).times(365).div(totalLiquidity).toString();
}
const calcTotalAPR = (
  poolAPR: string,
  liquidityMiningAPR: string,
  thirdPartyAPR: string
): string => {
  return bnum(poolAPR).plus(liquidityMiningAPR).plus(thirdPartyAPR).toString();
};


// const getPriceForAddress = (address: string): number => {
//   try {
//     const token = findTokenByAddress(tokenSet, address);
//     const p = prices.find(
//       (p: MarketDataResult) => p.symbol.toLowerCase() === token.symbol.toLowerCase()
//     );
//     return p ? p.current_price : 0;
//   } catch (e: any) {
//     // console.lo
//   }
//   return 0;
// };
function computeTotalAPRForPool(
  tokenRewards: LiquidityMiningTokenRewards[],
  totalLiquidity: string,
  marketPrices: MarketDataResult[],
  tokenSet: GenericTokenSet,
) {
  return tokenRewards
    .reduce(
      (totalRewards: AaveBigNumber, { amount, tokenAddress }) =>
        totalRewards.plus(
          computeAPRForPool(amount, getPriceForAddress(tokenSet, marketPrices, tokenAddress), totalLiquidity)
        ),
      bnum(0)
    )
    .toString();
}

function computeAPRsForPool(
  tokenRewards: LiquidityMiningTokenRewards[],
  totalLiquidity: string,
  marketPrices: MarketDataResult[],
  tokenSet: GenericTokenSet,
): { [address: string]: string } {
  // if (!tokenRewards || !tokenRewards.length) return '0';

  const rewardAPRs = tokenRewards.map((reward) => [
    getAddress(reward.tokenAddress),
    computeAPRForPool(reward.amount, getPriceForAddress(tokenSet, marketPrices, reward.tokenAddress), totalLiquidity)
  ]);
  // console.log('REWARD APRS', rewardAPRs)
  return Object.fromEntries(rewardAPRs);
}
export async function getMiningLiquidityApr (tokenSet: GenericTokenSet, pool: Pool, marketPrices: MarketDataResult[]): Promise<number> {
  let liquidityMiningAPR = '0';
  let liquidityMiningBreakdown = {};

  const url =
    'https://raw.githubusercontent.com/balancer-labs/frontend-v2/develop/src/lib/utils/liquidityMining/MultiTokenLiquidityMining.json';
  const { data } = await axios.get(url);
  const week = `week_${getCurrentLiquidityMiningWeek()}`;
  const weekStats: LiquidityMiningPoolResult[] | undefined = data[week];
  let liquidityMiningRewards: any = {};
  if (weekStats) {
    const rewards = weekStats.find((p: LiquidityMiningPoolResult) => p.chainId === 137)?.pools;
    if (rewards && rewards[pool.id]) {
      liquidityMiningRewards = rewards[pool.id];
    }
  }
  const miningTotalLiquidity = removeExcludedAddressesFromTotalLiquidity(
    pool,
    pool.totalLiquidity
  );
  const IS_LIQUIDITY_MINING_ENABLED = true;
  const hasLiquidityMiningRewards = IS_LIQUIDITY_MINING_ENABLED
    ? !!liquidityMiningRewards.length
    : false;

  if (hasLiquidityMiningRewards) {
    liquidityMiningAPR = computeTotalAPRForPool(liquidityMiningRewards, miningTotalLiquidity, marketPrices, tokenSet);
    liquidityMiningBreakdown = computeAPRsForPool(liquidityMiningRewards, miningTotalLiquidity, marketPrices, tokenSet);
  }
  return parseFloat(liquidityMiningAPR);
}

export async function getPools(addresses: string[]): Promise<Pool[]> {
  const poolResults = await client.query({
    query: GET_POOLS
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
