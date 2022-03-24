import { Vault__factory } from '@balancer-labs/typechain';
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { ERC20Abi } from '_abis/index';

import { EvmTokenDefinition} from '_enums/tokens';
import { useEffect, useState } from 'react';
import { BigNumber, Contract, ethers } from 'ethers';
import { getPoolAddress, StablePoolEncoder } from '@balancer-labs/sdk';
import useMarketPrices from '_hooks/useMarketPrices';
import { findTokenByAddress } from '_utils/index';
import { Pool, PoolToken } from '_interfaces/balancer';
import { getMiningLiquidityApr, getPools, getSwapApr, joinPool, exitPool } from '_services/balancerService';
import { Button } from '_components/core/Buttons';
import { getTokenTransferProxy } from '_services/paraSwapService';
import { approveToken, getTokenAllowance } from '_services/walletService';
import { getGasPrice } from '_services/gasService';
import { logTransactionHash } from '_services/dbService';
import { MaxUint256 } from '_utils/maths';
//\


export default function Invest() {
  const [pools, setPools] = useState<Pool[]>([]);
  const provider = useSelector((state: AppState) => state.web3.provider);
  const signer = useSelector((state: AppState) => state.web3.signer);
  const network = useSelector((state: AppState) => state.web3.network);
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const tokenSet = useSelector((state: AppState) => state.web3.tokenSet);
  const walletBAlances = useSelector((state: AppState) => state.wallet.balances);
  const prices = useMarketPrices();

  const initPools = async () => {
    if (provider && signer) {
      const addresses = Object.values(tokenSet).map((t: EvmTokenDefinition) => t.address);
      const pools = await getPools(addresses);
      for (const p of pools) {
        p.liquidityMiningApr = await getMiningLiquidityApr(tokenSet, p, prices);
        p.swapApr = await getSwapApr(p, provider, signer)
      }
      setPools(pools);
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
      const amountsOut = [
        '10000',
        '0',
        '0',
        '0'
      ];
      // @ts-ignore
      await exitPool(pool, userAddress, signer, amountsOut, gasResult?.fastest)
    } catch (e: any) {
      console.log(e);
    }
  };
  const join = async (pool: Pool) => {
    try {
      const gasResult = await getGasPrice(network.gasStationUrl);
      const amountsIn = [
        '100000',
        '0',
        '0',
        '0'
      ];
      // @ts-ignore
      await joinPool(pool, userAddress, signer, amountsIn, gasResult?.fastest)
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
      {pools.map((p:Pool) => {
        return (
          <div
            key={p.id}
            className={
              'bg-white rounded-2xl px-4 py-4 mb-2 border-2 -mx-1 border-gray-50 shadow-sm'
            }
          >
            <div className={'flex-row-center'}>
              <div className={'flex-row-center'}>
                {p.tokens.map((t: PoolToken) => {
                  return (
                    <span key={t.address}>
                      <img
                        className={'h-7 w-7'}
                        alt={t.address}
                        src={findTokenByAddress(tokenSet, t.address).image}
                      />
                    </span>
                  );
                })}
              </div>
              <div className={'ml-2'}>
                {p.tokens.map((t: PoolToken) => {
                  return (
                    <span
                      key={t.address}
                      className={'rounded-2xl text-body-smaller bg-gray-200 px-2 py-1'}
                    >
                      {t.symbol}
                    </span>
                  );
                })}
              </div>
              <div
                className={'ml-2 font-mono text-body-smaller '}
              >
                $
                {parseFloat(p.totalLiquidity).toLocaleString(undefined, {
                  maximumFractionDigits: 0
                })}
              </div>
              <div className={'ml-2'}>
                {p.swapApr}
                <br/>
                {p.liquidityMiningApr}
              </div>
              <Button onClick={() => join(p)}>Join</Button>
              <Button onClick={() => exit(p)}>Exit</Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
