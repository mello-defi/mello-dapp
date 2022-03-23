// import { getPoolAddress } from "@balancer-labs/balancer-js";
// import { BigNumber, Contract, ethers } from 'ethers';
// import { IERC20Abi } from ./IERC20.json
import ERC20Abi from '_enums/erc20.js';
import { Vault__factory, WeightedPool2TokensFactory__factory } from '@balancer-labs/typechain';
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { Button } from '_components/core/Buttons';
// import { JoinPoolRequest } from '@balancer-labs/sdk';
import { PolygonMainnetTokenContracts, polygonMainnetTokens } from '_enums/tokens';
import { ApolloClient, DefaultOptions, gql, InMemoryCache } from '@apollo/client';
import { useState } from 'react';
import { BigNumber as AaveBigNumber } from '@aave/protocol-js';
import { BigNumber, Contract, ethers } from 'ethers';
import { WeightedPoolEncoder } from '@balancer-labs/balancer-js';
import { getPoolAddress, StablePoolEncoder } from '@balancer-labs/sdk';
import { TransactionRequest, TransactionResponse } from '@ethersproject/abstract-provider';
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
  const walletBAlances = useSelector((state: AppState) => state.wallet.balances);
  // const tokenSet =

  const doStuff = async () => {
  // https://dev.balancer.fi/resources/joins-and-exits/pool-joins

    const addresses = Object.values(polygonMainnetTokens).map(t => t.address);

    console.log(addresses);
    console.log(Array.isArray(addresses));
    // REVIEW get working as query param, not stringify
    const GET_POOLS = gql`
      query GetPools {
        pools(first: 1000, skip:0, orderBy:totalLiquidity, orderDirection:desc, where: {totalLiquidity_gt: 10}) {
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
      if (tok.length > 0) {
        temp.push(pool);
        console.log(pool);
      }
    }
    setPools(temp);
  }

  const calcLiquidityMiningAPR = (pool: any) => {
    console.log(pool);
  }

  // const adjustAmp = (amp: OldBigNumber): OldBigNumber {
  //   return amp.times(this.AMP_PRECISION);
  // }


  // https://sourcegraph.com/github.com/balancer-labs/frontend-v2/-/blob/src/services/balancer/pools/weighted-pool.service.ts?L109:16
  // https://sourcegraph.com/github.com/balancer-labs/frontend-v2/-/blob/src/composables/pools/usePoolCreation.ts?L447:46#tab=def
  const exitPool = async (pool: any) => {
    const poolId = '0x0d34e5dd4d8f043557145598e4e2dc286b35fd4f000000000000000000000068';
    const vaultAddress = '0xBA12222222228d8Ba445958a75a0704d566BF2C8';
    const tokenAddresses = [
      '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', // USDC
      "0x2e1ad108ff1d8c782fcbbb89aad783ac49586756", // TUSD
      "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063", // DAI
      "0xc2132d05d31c914a87c6611c10748aeb04b58e8f"  // USDT
    ]
    const amountsOUt: string[] = [
      '0',
      '0',
      '10000',
      '0'
    ];
    // https://sourcegraph.com/github.com/balancer-labs/balancer-v2-monorepo/-/blob/pkg/pool-weighted/contracts/BaseWeightedPool.sol?L410\
    // https://sourcegraph.com/github.com/balancer-labs/balancer-v2-monorepo/-/blob/pkg/pool-stable/contracts/StablePool.sol
    // export const maxUint = (e: number): BigNumber => (2).pow(e).sub(1);
    // https://sourcegraph.com/github.com/balancer-labs/balancer-v2-monorepo/-/blob/pvt/helpers/src/models/pools/weighted/WeightedPool.ts?L589
    // const poolAddress = getPoolAddress(poolId)
    const MaxUint256: BigNumber = BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
    // console.log(MaxUint256.toString())
    // const bptToken = new Contract(poolAddress, ERC20Abi, signer)
    // const tx1: TransactionResponse = await bptToken.approve(userAddress, MaxUint256)
    // await tx1.wait(3);

    const vault = new Contract(vaultAddress, Vault__factory.abi, signer);
    const tx = await vault.exitPool(
      poolId,
      userAddress,
      userAddress,
      {
        assets: tokenAddresses,
        minAmountsOut: amountsOUt,
        fromInternalBalance: false,
        userData: StablePoolEncoder.exitBPTInForExactTokensOut(amountsOUt, MaxUint256),
      }
    );
    console.log(tx);
  }
  const join = async (pool: any) => {
    try {

      // console.log(pool);
      // const poolId = '0x0d34e5dd4d8f043557145598e4e2dc286b35fd4f000000000000000000000068';
      // const vaultAddress = '0xBA12222222228d8Ba445958a75a0704d566BF2C8';
      // const tokenAddresses = pool.tokens.map((tok: any) => tok.address); // USDC
      // const amountsIn: string[] = [];
      // const matchingtoken = polygonMainnetTokens[CryptoCurrencySymbol.USDC];
      // for (const tokenAddress of tokenAddresses) {
      //   let val = '0';
      //   if (tokenAddress === matchingtoken.address) {
      //     val = ethers.utils.parseUnits('0.1', matchingtoken.decimals).toString();
      //   }
      //   amountsIn.push(val);
      // }
      //
      // const vault = new Contract(vaultAddress, Vault__factory.abi, signer);
      // const tx = await vault.joinPool(
      //   pool.id,
      //   userAddress,
      //   userAddress,
      //   {
      //     assets: tokenAddresses,
      //     maxAmountsIn: amountsIn,
      //     fromInternalBalance: false,
      //     userData: pool.poolType === 'Stable' ? StablePoolEncoder.joinInit(amountsIn) : WeightedPoolEncoder.joinInit(amountsIn),
      //   }
      // );
      // console.log('tx', tx);
      const poolId = '0x0d34e5dd4d8f043557145598e4e2dc286b35fd4f000000000000000000000068';
      const vaultAddress = '0xBA12222222228d8Ba445958a75a0704d566BF2C8';
      const tokenAddresses = [
        '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', // USDC
        "0x2e1ad108ff1d8c782fcbbb89aad783ac49586756", // TUSD
        "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063", // DAI
        "0xc2132d05d31c914a87c6611c10748aeb04b58e8f"  // USDT
      ]
      const poolAddress = getPoolAddress(poolId)
      const MaxUint256: BigNumber = BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
      // console.log(MaxUint256.toString())
      // const bptToken = new Contract(poolAddress, ERC20Abi, signer)
      // const tx1: TransactionResponse = await bptToken.approve(userAddress, MaxUint256)
      // await tx1.wait(3);
      const contract2 = new ethers.Contract(poolAddress, ERC20Abi, signer);
      // const options: TransactionRequest = {};
      // const txResponse: TransactionResponse = await contract2.approve(poolAddress, MaxUint256, options);
      // await txResponse.wait(3);
      const aa: BigNumber = await contract2.allowance(userAddress, contract2.address);
      console.log(aa.toString());
      const amountsIn: string[] = [
        '100',
        '0',
        '0',
        '0'
      ];
      const vault = new Contract(vaultAddress, Vault__factory.abi, signer);
      const tx = await vault.joinPool(
        poolId,
        userAddress,
        userAddress,
        {
          assets: tokenAddresses,
          maxAmountsIn: amountsIn,
          fromInternalBalance: false,
          userData: StablePoolEncoder.joinExactTokensInForBPTOut(amountsIn, BigNumber.from('0')),
        }
      );
      console.log('tx', tx);
    } catch (e: any) {
      console.log(e);
    }
  }

  const calculateApr = (pool: any) => {

    // calculateIncentivesAPY()
  // private calcAPR(
  //     pool: Pool,
  //     pastPool: Pool | undefined,
  //     protocolFeePercentage: number
  // ) {
  //     if (!pastPool)
        return new AaveBigNumber(pool.totalSwapFee)
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
                    {/*<img className={'h-7 w-7 overflow-x-hidden'} alt={t.id} src={findTokenByAddress(tokenSet, t.address).image}/>*/}
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
                {/*${parseFloat(p.totalLiquidity).toFixed(2)}*/}
                {p.totalLiquidity}
                <br/>
                {/*{p.id}*/}
                {calculateApr(p)}
              </div>
              <div className={'ml-2'}>
                {p.poolType}
              </div>
            </div>
            <div>
              <Button onClick={() => join(p)}>Join</Button>
              <Button onClick={() => exitPool(p)}>Exit</Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}