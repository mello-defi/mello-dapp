import { ApolloClient, DefaultOptions, gql, InMemoryCache } from '@apollo/client';
import { ethers } from 'ethers';
import { Pool, PoolToken, UserPool } from '_interfaces/balancer';
import { twentyFourHoursInSecs } from '_utils/time';

const MINIMUM_LIQUIDITY = '1000000';
// TODO reuse data props like this https://sourcegraph.com/github.com/georgeroman/balancer-v2-pools/-/blob/src/subgraph/index.ts?L9
const GET_USER_POOLS = gql`
  query getUserPools($userAddress: String!) {
    poolShares(
      where: { userAddress: $userAddress, balance_gt: 0 }
      orderBy: balance
      orderDirection: desc
      where: { poolType_in: ["Weighted", "Stable"] }
    ) {
      id
      poolId {
        id
        address
        poolType
        totalLiquidity
        strategyType
        totalSwapFee
        totalShares
        swapFee
        symbol
        amp
        tokens {
          id
          symbol
          name
          decimals
          address
          priceRate
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
      totalShares
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
        priceRate
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
  query GetPools($minimumLiquidity: String!) {
    pools(
      first: 1000
      skip: 0
      orderBy: totalLiquidity
      orderDirection: desc
      where: { poolType_in: ["Weighted", "Stable"], totalLiquidity_gte: $minimumLiquidity }
    ) {
      id
      address
      poolType
      totalLiquidity
      strategyType
      totalSwapFee
      swapFee
      totalShares
      symbol
      amp
      tokens {
        id
        symbol
        name
        decimals
        priceRate
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
  // TODO make network specific
  uri: 'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-polygon-v2',
  cache: new InMemoryCache({ resultCaching: false }),
  defaultOptions
});

const getBlockNum = async (provider: ethers.providers.Web3Provider): Promise<number> => {
  const currentBlock = await provider.getBlockNumber();
  const blocksInDay = Math.round(twentyFourHoursInSecs / 2);
  return currentBlock - blocksInDay;
};

export const getPastPools = async (
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

export async function getUserPools(userAddress: string): Promise<UserPool[]> {
  const userPools = await client.query({
    query: GET_USER_POOLS,
    variables: { userAddress: userAddress.toLowerCase() }
  });
  return userPools.data ? userPools.data.poolShares : [];
}
export async function getPools(addresses: string[]): Promise<Pool[]> {
  const addressesLowercase = addresses.map((address) => address.toLowerCase());
  const poolResults = await client.query({
    query: GET_ALL_POOLS,
    variables: {
      minimumLiquidity: MINIMUM_LIQUIDITY
    }
  });
  if (!poolResults.data) {
    return [];
  }

  return poolResults.data.pools.filter((pool: Pool) => {
    const tokenAddresses = pool.tokens.map((token: PoolToken) => token.address.toLowerCase());
    return (
      tokenAddresses.filter((address) => addressesLowercase.includes(address)).length ===
      tokenAddresses.length
    );
  });
}
