import useMarketPrices from '_hooks/useMarketPrices';
import { Pool, UserPool } from '_interfaces/balancer';
import { HorizontalLineBreak } from '_components/core/HorizontalLineBreak';
import PoolTokenIcons from '_components/balancer/PoolTokenIcons';
import PoolRow from '_components/balancer/PoolRow';
import useUserBalancerPools from '_hooks/useUserBalancerPools';
import useBalancerPools from '_hooks/useBalancerPools';
import { useEffect, useState } from 'react';
import { keyBy } from 'lodash';
import { BigNumber as AdvancedBigNumber } from '@aave/protocol-js';

export default function Invest() {
  const prices = useMarketPrices();
  const userPools = useUserBalancerPools();
  const pools = useBalancerPools(prices);
  const [totalInvested, setTotalInvested] = useState('');

  useEffect(() => {
    if (userPools && userPools.length > 0 && pools && pools.length > 0) {
      const poolsWithShares = userPools.map((userPool: UserPool) => {
        const pool = userPool.poolId;
        return {
          ...pool,
          shares: new AdvancedBigNumber(pool.totalLiquidity)
            .div(pool.totalShares)
            .times(userPool.balance)
            .toString()
        }
      });

      const totalInvestedAmount = poolsWithShares
        .map(pool => pool.shares)
        .reduce((totalShares, shares) => totalShares.plus(shares), new AdvancedBigNumber(0))
        .toNumber()
        .toLocaleString(undefined, {
          maximumFractionDigits: 2
        })
      setTotalInvested(totalInvestedAmount);
    }
  }, [userPools, pools]);

  const getPool = (poolId: string): Pool => {
    // @ts-ignore
    return pools?.find(pool => pool.id === poolId);
  }
  return (
    <div>
      {userPools && userPools?.length > 0 && pools && pools.length > 0 && (
        <div>
          <div className={'flex-row-center justify-between px-2'}>
            <span className={'text-body'}>My Investments</span>
            <span>Total invested: <span className={'font-mono'}>${totalInvested}</span></span>
          </div>
          {userPools?.map((pool: UserPool) => (
            <PoolRow pool={getPool(pool.poolId.id)} key={pool.id} userBalance={pool.balance} />
          ))}
        </div>
      )}
      <HorizontalLineBreak />
      <span className={'text-body'}>Investment pools</span>
      {pools?.map((p: Pool) => {
        return <PoolRow key={p.id} pool={p} />;
      })}
    </div>
  );
}
