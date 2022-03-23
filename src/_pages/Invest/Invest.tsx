// import { getPoolAddress } from "@balancer-labs/balancer-js";
// import { BigNumber, Contract, ethers } from 'ethers';
// import { IERC20Abi } from ./IERC20.json
import ERC20Abi from '_enums/erc20.js';
import { Vault__factory, WeightedPool2TokensFactory__factory } from '@balancer-labs/typechain';
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { Button } from '_components/core/Buttons';
// import { JoinPoolRequest } from '@balancer-labs/sdk';
import { differenceInWeeks } from 'date-fns';

import { PolygonMainnetTokenContracts, polygonMainnetTokens } from '_enums/tokens';
import { ApolloClient, DefaultOptions, gql, InMemoryCache } from '@apollo/client';
import { useState } from 'react';
import { BigNumber as AaveBigNumber } from '@aave/protocol-js';
import { BigNumber, Contract, ethers } from 'ethers';
import { WeightedPoolEncoder } from '@balancer-labs/balancer-js';
import { getPoolAddress, StablePoolEncoder } from '@balancer-labs/sdk';
import axios from 'axios';
import { TransactionRequest, TransactionResponse } from '@ethersproject/abstract-provider';
import useMarketPrices from '_hooks/useMarketPrices';
import { findTokenByAddress } from '_utils/index';
import { MarketDataResult } from '_services/marketDataService';
import { getAddress } from 'ethers/lib/utils';
//\

const collectorAbi = [
  {
    "inputs": [
      {
        "internalType": "contract IVault",
        "name": "_vault",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newFlashLoanFeePercentage",
        "type": "uint256"
      }
    ],
    "name": "FlashLoanFeePercentageChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newSwapFeePercentage",
        "type": "uint256"
      }
    ],
    "name": "SwapFeePercentageChanged",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "selector",
        "type": "bytes4"
      }
    ],
    "name": "getActionId",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAuthorizer",
    "outputs": [
      {
        "internalType": "contract IAuthorizer",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "contract IERC20[]",
        "name": "tokens",
        "type": "address[]"
      }
    ],
    "name": "getCollectedFeeAmounts",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "feeAmounts",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getFlashLoanFeePercentage",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getSwapFeePercentage",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "newFlashLoanFeePercentage",
        "type": "uint256"
      }
    ],
    "name": "setFlashLoanFeePercentage",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "newSwapFeePercentage",
        "type": "uint256"
      }
    ],
    "name": "setSwapFeePercentage",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "vault",
    "outputs": [
      {
        "internalType": "contract IVault",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "contract IERC20[]",
        "name": "tokens",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "amounts",
        "type": "uint256[]"
      },
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      }
    ],
    "name": "withdrawCollectedFees",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
const vaultAddress = '0xBA12222222228d8Ba445958a75a0704d566BF2C8';

type LiquidityMiningTokenRewards = {
  tokenAddress: string;
  amount: number;
};


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
  const prices = useMarketPrices();
  // const tokenSet =

  const doStuff = async () => {
  // https://dev.balancer.fi/resources/joins-and-exits/pool-joins

    const addresses = Object.values(polygonMainnetTokens).map(t => t.address);

    console.log(addresses);
    console.log(Array.isArray(addresses));
    // REVIEW get working as query param, not stringify
    const GET_POOLS = gql`
      query GetPools {
        pools(first: 1000, skip:0, orderBy:totalLiquidity, orderDirection:desc, where: {id: "0xcf354603a9aebd2ff9f33e1b04246d8ea204ae9500020000000000000000005a"}) {
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
    const tokenAddresses = [
      '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', // USDC
      "0x2e1ad108ff1d8c782fcbbb89aad783ac49586756", // TUSD
      "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063", // DAI
      "0xc2132d05d31c914a87c6611c10748aeb04b58e8f"  // USDT
    ]
    const amountsOUt: string[] = [
      '0',
      '0',
      ethers.utils.parseUnits('0.05', 18).toString(),
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
    console.log(vault.functions);
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
        '100000',
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

    const calcTotalAPR = (
        poolAPR: string,
        liquidityMiningAPR: string,
        thirdPartyAPR: string
    ): string => {
        return bnum(poolAPR)
          .plus(liquidityMiningAPR)
          .plus(thirdPartyAPR)
          .toString();
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

    return bnum(rewards)
      .div(7)
      .times(tokenPrice)
      .times(365)
      .div(totalLiquidity)
      .toString();
  }


  const getPriceForAddress = (address: string): number => {
    try {
      const token = findTokenByAddress(tokenSet, address);
      const p = prices.find((p: MarketDataResult) => p.symbol.toLowerCase() === token.symbol.toLowerCase());
      return p ? p.current_price: 0;
    } catch (e: any) {
      // console.lo
    }
    return 0;
  }
  function computeTotalAPRForPool(
    tokenRewards: LiquidityMiningTokenRewards[],
    totalLiquidity: string
  ) {
    // console.log('REWAORDS,',tokenRewards)
    // console.log('totalLiquidity', totalLiquidity)
    return tokenRewards
      .reduce(
        (totalRewards: AaveBigNumber, { amount, tokenAddress }) =>
          totalRewards.plus(
            computeAPRForPool(
              amount,
              getPriceForAddress(tokenAddress),
              totalLiquidity
            )
          ),
        bnum(0)
      )
      .toString();
  }

  function computeAPRsForPool(
    tokenRewards: LiquidityMiningTokenRewards[],
    totalLiquidity: string
  ): { [address: string]: string } {
    const rewardAPRs = tokenRewards.map(reward => [
      getAddress(reward.tokenAddress),
      computeAPRForPool(
        reward.amount,
        getPriceForAddress(reward.tokenAddress),
        totalLiquidity
      )
    ]);
    // console.log('REWARD APRS', rewardAPRs)
    return Object.fromEntries(rewardAPRs);
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

  const removeExcludedAddressesFromTotalLiquidity = (
    pool: any,
    totalLiquidityString: string
)  => {
    return removeAddressesFromTotalLiquidity(
      pool,
      totalLiquidityString
    );
  }

  function bnum(val: string | number | BigNumber): AaveBigNumber {
    const number = typeof val === 'string' ? val : val ? val.toString() : '0';
    return new AaveBigNumber(number);
  }


  const oneSecondInMs = 1000;
  const oneMinInMs = 60 * oneSecondInMs;
  const oneHourInMs = 60 * oneMinInMs;

  const twentyFourHoursInMs = 24 * oneHourInMs;
  const twentyFourHoursInSecs = twentyFourHoursInMs / oneSecondInMs;

  const getblocknum = async (): Promise<number> => {
    // @ts-ignore
    const currentBlock = await provider.getBlockNumber();
    const blocksInDay = Math.round(
      twentyFourHoursInSecs / 2
    );
    return currentBlock - blocksInDay;
  }

  const getPastPools = async () => {
    // const pastPoolsQuery = this.query({ where: isInPoolIds, block });
    const blockNum = await getblocknum();
    const q = gql`
          query GetPools($block: Int!) {
        pools(where:{id_in:["0xcf354603a9aebd2ff9f33e1b04246d8ea204ae9500020000000000000000005a"]}, block:{number: $block}) {
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
`

    // console.log('blockNum', blockNum)
    const poolReslts = await client.query({
      query: q,
      variables: { block: blockNum}
    });
    // console.log
    // return p
    console.log('poolReslts', poolReslts)
    return poolReslts.data ? poolReslts.data.pools[0] : null;
  }

  const getSwapApr = async (pool: any): Promise<number> => {
    const pastPool = await getPastPools();
    // console.log('PAST POOL', pastPool);
    const vault = new Contract(vaultAddress, Vault__factory.abi, signer);
    const collectorAddress = await vault.getProtocolFeesCollector();
    const collector = new Contract(collectorAddress, collectorAbi, signer);
    const swapFeePercentage = await collector.getSwapFeePercentage();
    const protocolFeePercentage = (swapFeePercentage / (10 ** 18));
    let poolApr: any = '';
    if (!pastPool) {
      poolApr = bnum(pool.totalSwapFee)
        .times(1 - protocolFeePercentage)
        .dividedBy(pool.totalLiquidity)
        .multipliedBy(365)
    } else {
      const swapFees = bnum(pool.totalSwapFee).minus(pastPool.totalSwapFee);
      poolApr = swapFees
        .times(1 - protocolFeePercentage)
        .dividedBy(pool.totalLiquidity)
        .multipliedBy(365)
    }
    return Number(poolApr.times(100));
  }

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


  // Liquidity mining started on June 1, 2020 00:00 UTC
  const liquidityMiningStartTime = Date.UTC(2020, 5, 1, 0, 0);

  function getCurrentLiquidityMiningWeek() {
    return differenceInWeeks(toUtcTime(new Date()), liquidityMiningStartTime) + 1;
  }

  const getMiningLiquidityApr = async (pool: any) : Promise<number> => {
    let liquidityMiningAPR = '0';
    let liquidityMiningBreakdown = {};

    const url = 'https://raw.githubusercontent.com/balancer-labs/frontend-v2/develop/src/lib/utils/liquidityMining/MultiTokenLiquidityMining.json';
    const { data} = await axios.get(url);
    const week = `week_${getCurrentLiquidityMiningWeek()}`;
    const weekStats = data[week];
    let liquidityMiningRewards : any = {};
    if (weekStats) {
      const hasrewards = weekStats.find((p: any) => p.chainId === 137)?.pools
      if (hasrewards && hasrewards[pool.id]) {
        liquidityMiningRewards = hasrewards[pool.id];
        // console.log(rewards);
      }
    }
    // const liquidityMiningRewards = currentLiquidityMiningRewards[pool.id];
    // const rewards = [
    //   {
    //     "tokenAddress": "0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3",
    //     "amount": 1750
    //   }
    // ]
    const miningTotalLiquidity = removeExcludedAddressesFromTotalLiquidity(
      pool,
      pool.totalLiquidity
    );
    const IS_LIQUIDITY_MINING_ENABLED = true;
    const hasLiquidityMiningRewards = IS_LIQUIDITY_MINING_ENABLED
      ? !!liquidityMiningRewards
      : false;

    if (hasLiquidityMiningRewards) {
      liquidityMiningAPR = computeTotalAPRForPool(
        liquidityMiningRewards,
        miningTotalLiquidity
      );
      liquidityMiningBreakdown = computeAPRsForPool(
        liquidityMiningRewards,
        miningTotalLiquidity
      );
    }
    return parseFloat(liquidityMiningAPR);
  }
  const calculateApr = (pool: any) => {
    // const poolApr =
    // if (pool.id === '0xcf354603a9aebd2ff9f33e1b04246d8ea204ae9500020000000000000000005a') {
      // console.log('POOl', pool)
      // const
      // const block = { number: blockNumber };
      // const isInPoolIds = { id_in: pools.map(pool => pool.id) };
      // const pastPoolsQuery = this.query({ where: isInPoolIds, block });
      getMiningLiquidityApr(pool).then((apr: number) => {
        // console.log('apr', apr)
        getSwapApr(pool).then((swapApr: number) => {
          console.log('swapApr', swapApr)
          console.log('jmining apr', apr)
          const totalApr = apr + swapApr;
          console.log('total apr', totalApr)
          return totalApr;
          // console.log('totalApr', totalApr)
          // setApr(totalApr);
        });
      })

      // console.log('luquidity', parseFloat(liquidityMiningAPR) * 100);
      // console.log('liquidityMiningBreakdown', liquidityMiningBreakdown);
      // console.log(bnum(poolAPR)
      //   .plus(liquidityMiningAPR)
      //   // .plus(thirdPartyAPR)
      //   .toString());
    // }

    // return 'aaa';

    // calculateIncentivesAPY()
  // private calcAPR(
  //     pool: Pool,
  //     pastPool: Pool | undefined,
  //     protocolFeePercentage: number
  // ) {
  //     if (!pastPool)
  //       return bnum(pool.totalSwapFee)
  //         .times(1 - parseFloat(pool.swapFee))
  //         .dividedBy(pool.totalLiquidity)
  //         .multipliedBy(365)
  //         .toString();

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