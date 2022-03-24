import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { ERC20Abi } from '_abis/index';

import { EvmTokenDefinition, PolygonMainnetTokenContracts } from '_enums/tokens';
import { useEffect, useState } from 'react';
import { Contract, ethers } from 'ethers';
import useMarketPrices from '_hooks/useMarketPrices';
import { Pool, UserPool } from '_interfaces/balancer';
import {
  exitPool,
  getMiningLiquidityApr,
  getPools,
  getSwapApr,
  getUserPools,
  joinPool
} from '_services/balancerService';
import { approveToken, getTokenAllowance } from '_services/walletService';
import { getGasPrice } from '_services/gasService';
import { logTransactionHash } from '_services/dbService';
import { MaxUint256 } from '_utils/maths';
import { HorizontalLineBreak } from '_components/core/HorizontalLineBreak';
import PoolTokenIcons from '_components/balancer/PoolTokenIcons';
import PoolTokenSymbols from '_components/balancer/PoolTokenSymbols';
// import { createWatcher } from '@makerdao/multicall';
// import configs from '@makerdao/multicall/src/addresses.json'
// import { Interface } from 'readline';
import { Interface } from '@ethersproject/abi';
import useWalletBalances from '_hooks/useWalletBalances';
//\


export default function Invest() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [userPools, setUserPools] = useState<UserPool[]>([]);
  const provider = useSelector((state: AppState) => state.web3.provider);
  const signer = useSelector((state: AppState) => state.web3.signer);
  const network = useSelector((state: AppState) => state.web3.network);
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const tokenSet = useSelector((state: AppState) => state.web3.tokenSet);
  const walletBAlances = useSelector((state: AppState) => state.wallet.balances);
  const prices = useMarketPrices();
  const b = useWalletBalances();
  // const balance = useWalletBalance(tokenSet.USDC)

  // configs.
  const initPools = async () => {
    if (provider && signer && userAddress) {

      // const addresses = Object.values(tokenSet).map((t: EvmTokenDefinition) => t.address);
      // const pools = await getPools(addresses);
      // for (const p of pools) {
      //   p.liquidityMiningApr = await getMiningLiquidityApr(tokenSet, p, prices);
      //   p.swapApr = await getSwapApr(p, provider, signer);
      //   p.totalApr = (p.liquidityMiningApr + p.swapApr).toFixed(2)
      // }
      // setPools(pools);
      // const results = await getUserPools(userAddress);
      // setUserPools(results);
    }
  };


  // https://sourcegraph.com/github.com/balancer-labs/frontend-v2/-/blob/src/services/balancer/pools/weighted-pool.service.ts?L109:16
  // https://sourcegraph.com/github.com/balancer-labs/frontend-v2/-/blob/src/composables/pools/usePoolCreation.ts?L447:46#tab=def
  const checkAndApproveAllowance = async (
    poolAddress: string,
    provider: ethers.providers.Web3Provider,
    signer: ethers.Signer,
    userAddress: string
  ) => {
    const allowance = await getTokenAllowance(poolAddress, ERC20Abi, provider, userAddress);
    if (allowance.eq(0)) {
      const approvalGasResult = await getGasPrice(network.gasStationUrl);
      const approvalTxHash = await approveToken(
        poolAddress,
        ERC20Abi,
        signer,
        userAddress,
        MaxUint256,
        approvalGasResult?.fastest,
        poolAddress
      );
      logTransactionHash(approvalTxHash.hash, network.chainId);
      // setApprovalTransactionHAsh(approvalTxHash.hash);
      await approvalTxHash.wait(approvalGasResult?.blockTime || 3);
    }
  };
  const exit = async (pool: any) => {
    try {
      // await checkAndApproveAllowance(pool.address, provider, signer, userAddress);
      const gasResult = await getGasPrice(network.gasStationUrl);
      const amountsOut = ['50000', '0', '0', '0'];
      // @ts-ignore
      await exitPool(pool, userAddress, signer, amountsOut, gasResult?.fastest);
    } catch (e: any) {
      console.log(e);
    }
  };
  const join = async (pool: Pool) => {
    try {
      const gasResult = await getGasPrice(network.gasStationUrl);
      const amountsIn = ['100000', '0', '0', '0'];
      // @ts-ignore
      await joinPool(pool, userAddress, signer, amountsIn, gasResult?.fastest);
    } catch (e: any) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (!pools.length && prices.length > 0) {
      initPools();
    }
  }, [pools, prices]);

  return (
    <div>
      <h1>Invest</h1>
      {userPools &&
        userPools.map((pool: UserPool) => (
          <div key={pool.poolId.address}>
            <PoolTokenIcons tokens={pool.poolId.tokens} />
            <h2>{pool.balance}</h2>
          </div>
        ))}
      <HorizontalLineBreak />
      {pools.map((p: Pool) => {
        return (
          <div
            key={p.id}
            className={
              'bg-white rounded-2xl px-2 md:px-4 py-4 mb-2 border-2 -mx-1 border-gray-50 shadow-sm flex flex-col md:flex-row items-center justify-between'
            }
          >
            <div className={'flex-row-center space-x-1 md:space-x-2 justify-between md:w-auto w-full'}>
              <PoolTokenIcons tokens={p.tokens} />
              <PoolTokenSymbols tokens={p.tokens} />
            </div>
            {/*<Button onClick={() => join(p)}>Join</Button>*/}
            {/*<Button onClick={() => exit(p)}>Exit</Button>*/}
            <div className={'flex flex-col text-body-smaller text-right'}>
              <div className={'font-mono'}>
                $
                {parseFloat(p.totalLiquidity).toLocaleString(undefined, {
                  maximumFractionDigits: 0
                })}
              </div>
              <div>
                {p.totalApr}% APR
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
