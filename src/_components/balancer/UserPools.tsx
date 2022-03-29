import { Pool, UserPool } from '_interfaces/balancer';
import PoolRow from '_components/balancer/PoolRow';
import { calculateUserSharesInFiat } from '_services/balancerService';
import React, { useEffect, useState } from 'react';
import PoolSkeleton from '_components/balancer/PoolSkeleton';
import useUserBalancerPools from '_hooks/useUserBalancerPools';
import useBalancerPools from '_hooks/useBalancerPools';
import { BigNumber as AdvancedBigNumber } from '@aave/protocol-js';
import useMarketPrices from '_hooks/useMarketPrices';
import PoweredByLink from '_components/core/PoweredByLink';
import { balLogo } from '_assets/images';

export default function UserPools (){
  const prices = useMarketPrices()
  const pools = useBalancerPools(prices);
  const { userPools, totalInvestedAmount } = useUserBalancerPools();


  // const [totalInvested, setTotalInvested] = useState('');

  const getPool = (poolId: string): Pool => {
    // @ts-ignore
    return pools?.find(pool => pool.id === poolId);
}
  return (
    <>
      {!userPools && (
        <div>
          <PoolSkeleton numberOfSymbols={3}/>
          <PoolSkeleton numberOfSymbols={2}/>
        </div>
      )}
      {userPools && userPools?.length > 0 && pools && pools.length > 0 && (
        <div>
          <div className={'flex-row-center justify-between px-2 mb-1'}>
            <span className={'text-body'}>Investments</span>
            {totalInvestedAmount && (
              <span>Total invested: <span className={'font-mono'}>${totalInvestedAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></span>
            )}
            {/*<PoweredByLink url={'https://balancer.fi/#/'} logo={balLogo}/>*/}
          </div>
          {userPools?.map((userPool: UserPool) => (
            <PoolRow pool={getPool(userPool.poolId.id)} key={userPool.id} userBalance={calculateUserSharesInFiat(userPool.poolId, userPool)} />
          ))}
        </div>
      )}
    </>
  )
}