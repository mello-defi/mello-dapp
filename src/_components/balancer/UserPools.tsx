import { UserPool } from '_interfaces/balancer';
import PoolRow from '_components/balancer/PoolRow';
import { calculateUserSharesInFiat } from '_services/balancerCalculatorService';
import React, { useEffect } from 'react';
import PoolSkeleton from '_components/balancer/PoolSkeleton';
import useUserBalancerPools from '_hooks/useUserBalancerPools';
import PoweredByLink from '_components/core/PoweredByLink';
import { balLogo } from '_assets/images';
import { HorizontalLineBreak } from '_components/core/HorizontalLineBreak';
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';

export default function UserPools() {
  const { userPools, totalInvestedAmount } = useUserBalancerPools();
  const address = useSelector((state: AppState) => state.wallet.address);
  const provider = useSelector((state: AppState) => state.web3.provider);

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
            <span className={'text-body'}>My investments</span>
            {totalInvestedAmount && (
              <span>
                Total invested:{' '}
                <span className={'font-mono'}>
                  $
                  {totalInvestedAmount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
              </span>
            )}
          </div>
          {userPools.map((userPool: UserPool) => (
            <PoolRow
              poolId={userPool.poolId.id}
              key={userPool.id}
              allowFunctions={false}
              userBalance={calculateUserSharesInFiat(userPool.poolId, userPool)}
            />
          ))}
          {/*<HorizontalLineBreak />*/}
        </div>
      )}
    </>
  );
}
