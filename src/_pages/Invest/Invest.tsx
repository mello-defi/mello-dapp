import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { ERC20Abi } from '_abis/index';

import { EvmTokenDefinition, PolygonMainnetTokenContracts } from '_enums/tokens';
import { useEffect, useState } from 'react';
import { Contract, ethers } from 'ethers';
import useMarketPrices from '_hooks/useMarketPrices';
import { Pool, UserPool } from '_interfaces/balancer';
import {
  getMiningLiquidityApr,
  getPools,
  getSwapApr,
  getUserPools,
} from '_services/balancerService';
import { HorizontalLineBreak } from '_components/core/HorizontalLineBreak';
import PoolTokenIcons from '_components/balancer/PoolTokenIcons';
import PoolRow from '_components/balancer/PoolRow';
//\


export default function Invest() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [userPools, setUserPools] = useState<UserPool[]>([]);
  const provider = useSelector((state: AppState) => state.web3.provider);
  const signer = useSelector((state: AppState) => state.web3.signer);
  const network = useSelector((state: AppState) => state.web3.network);
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const tokenSet = useSelector((state: AppState) => state.web3.tokenSet);
  const prices = useMarketPrices();
  // const walletBalances = useWalletBalances();
  const initPools = async () => {
    console.log('initPools');
    if (provider && signer && userAddress) {
      const addresses = Object.values(tokenSet).map((t: EvmTokenDefinition) => t.address);
      const pools = await getPools(addresses);
      setPools(pools);
      const results = await getUserPools(userAddress);
      setUserPools(results);
    }
  };

  useEffect(() => {
    if (pools.length && provider && signer) {
      const getPoolAprs = async () => {
        const tempPools = [...pools];
        for (const p of tempPools) {
          p.liquidityMiningApr = await getMiningLiquidityApr(tokenSet, p, prices);
          p.swapApr = await getSwapApr(p, provider, signer);
          p.totalApr = (p.liquidityMiningApr + p.swapApr).toFixed(2)
        }
        setPools(tempPools);
      }
      getPoolAprs()
    }
  }, [pools])

  useEffect(() => {
    if (!pools.length && prices.length > 0) {
      initPools();
    }
  }, [pools, prices, provider, signer, userAddress]);

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
          <PoolRow key={p.id} pool={p}/>
        );
      })}
    </div>
  );
}
