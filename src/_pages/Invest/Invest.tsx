
import { getPoolAddress } from "@balancer-labs/balancer-js";
// import { BigNumber, Contract, ethers } from 'ethers';
// import { IERC20Abi } from ./IERC20.json
import ERC20Abi from '_enums/erc20.js';
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { Button } from '_components/core/Buttons';
import { JoinPoolRequest } from '@balancer-labs/sdk';
import { polygonMainnetTokens } from '_enums/tokens';
import { CryptoCurrencySymbol } from '_enums/currency';
import { ApolloClient, DefaultOptions, gql, InMemoryCache } from '@apollo/client';
import { useState } from 'react';
import { findTokenByAddress } from '_utils/index';
import { BigNumber, calculateIncentivesAPY } from '@aave/protocol-js';

//
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
  uri: 'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-polygon-v2',
  cache: new InMemoryCache({ resultCaching: false }),
  defaultOptions
});

export default function Invest () {
  const [pools, setPools] = useState<any[]>([]);
  const provider = useSelector((state: AppState) => state.web3.provider);
  const signer = useSelector((state: AppState) => state.web3.signer);
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const tokenSet = useSelector((state: AppState) => state.web3.tokenSet);
  // const tokenSet =

  // https://dev.balancer.fi/resources/joins-and-exits/pool-joins
  // https://dev.balancer.fi/resources/internal-user-balances
  const doStuff = async () => {
    // const provider = ethers.Wallet.createRandom();
    const addresses = Object.values(polygonMainnetTokens).map(t => t.address);

    console.log(addresses);
    console.log(Array.isArray(addresses));
    // REVIEW get working as query param, not stringify
    const GET_POOLS = gql`
      query GetPools {
        pools(first: 1000, skip:0, orderBy:totalLiquidity, orderDirection:desc) {
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
    const poolReslts = await client.query({
      query: GET_POOLS,
      variables: { tokenAddresses: addresses}
    });
    const temp = [];
    for (const pool of poolReslts.data.pools) {
      const tok = pool.tokens.filter((t: any) => addresses.includes(t.address));
      if (tok.length === pool.tokens.length) {
        temp.push(pool);
        console.log(pool);
      }
    }
    setPools(temp);
  }

  const calculateApr = (pool: any) => {

    // calculateIncentivesAPY()
  // private calcAPR(
  //     pool: Pool,
  //     pastPool: Pool | undefined,
  //     protocolFeePercentage: number
  // ) {
  //     if (!pastPool)
        return new BigNumber(pool.totalSwapFee)
          .times(1 - parseFloat(pool.swapFee))
          .dividedBy(pool.totalLiquidity)
          .multipliedBy(365)
          .toString();

  //     const swapFees = bnum(pool.totalSwapFee).minus(pastPool.totalSwapFee);
  //     return swapFees
  //       .times(1 - protocolFeePercentage)
  //       .dividedBy(pool.totalLiquidity)
  //       .multipliedBy(365)
  //       .toString();
  // //   }

  }

  return (
    <div>
      <h1>Invest</h1>
      <Button onClick={doStuff}>Invest</Button>
      {pools.map((p) => {
        return (
          <div key={p.id} className={'bg-white rounded-2xl px-4 py-4 mb-2 border-2 -mx-1 border-gray-50 shadow-sm'}>
            <div className={'flex-row-center'}>
              <div className={'flex-row-center'}>
                {p.tokens.map((t: any) => {
                  return (
                    <span key={t.id}>
                    <img className={'h-7 w-7 overflow-x-hidden'} alt={t.id} src={findTokenByAddress(tokenSet, t.address).image}/>
                  </span>
                  )
                })}
              </div>
              <div className={'ml-2'}>
                {p.tokens.map((t: any) => {
                  return (
                    <span key={t.id} className={'rounded-2xl text-body-smaller bg-gray-200 px-2 py-1'}>
                      {t.symbol}
                    </span>
                  )
                })}
              </div>
              <div
              onClick={() => window.open(`https://polygon.balancer.fi/#/pool/${p.id}`, '_blank')}
                className={'ml-2 font-mono text-body-smaller '}>
                ${parseFloat(p.totalLiquidity).toFixed(2)}
                <br/>
                {/*{p.id}*/}
                {calculateApr(p)}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}