import { UserPool } from '_interfaces/balancer';
import PoolRow from '_components/balancer/PoolRow';
import { calculateUserSharesInFiat } from '_services/balancerCalculatorService';
import React from 'react';
import PoolSkeleton from '_components/balancer/PoolSkeleton';
import useUserBalancerPools from '_hooks/useUserBalancerPools';
import PoweredByLink from '_components/core/PoweredByLink';
import { balLogo } from '_assets/images';

export default function UserPools() {
  const { userPools, totalInvestedAmount } = useUserBalancerPools();

  return (
    <>
      {!userPools && (
        <div>
          <PoolSkeleton numberOfSymbols={3} />
          <PoolSkeleton numberOfSymbols={2} />
        </div>
      )}
      {userPools && userPools?.length > 0 && (
        <div>
          <div className={'flex-row-center justify-between px-2 mb-2'}>
            <span className={'text-body'}>Investments</span>
            {/*{totalInvestedAmount && (*/}
            {/*  <span>*/}
            {/*    Total invested:{' '}*/}
            {/*    <span className={'font-mono'}>*/}
            {/*      $*/}
            {/*      {totalInvestedAmount.toLocaleString(undefined, {*/}
            {/*        minimumFractionDigits: 2,*/}
            {/*        maximumFractionDigits: 2*/}
            {/*      })}*/}
            {/*    </span>*/}
            {/*  </span>*/}
            {/*)}*/}
            <PoweredByLink url={'https://balancer.fi/#/'} logo={balLogo} />
          </div>
          {userPools?.map((userPool: UserPool) => (
            <PoolRow
              pool={userPool.poolId}
              key={userPool.id}
              userBalance={calculateUserSharesInFiat(userPool.poolId, userPool)}
            />
          ))}
        </div>
      )}
    </>
  );
}
