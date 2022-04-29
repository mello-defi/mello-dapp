import { ComputedUserReserve } from '@aave/protocol-js/dist/v2/types';
import UserReserveListItem from '_components/aave/UserReserveListItem';
import React from 'react';
import useAaveUserSummary from '_hooks/useAaveUserSummary';
import UserReservesSkeleton from '_components/aave/skeletons/UserReservesSkeleton';
import { parseUnits } from 'ethers/lib/utils';

export default function UserDepositSummary() {
  const userSummary = useAaveUserSummary();

  const reserveBalanceGtZero = (reserve: ComputedUserReserve): boolean => {
    return parseUnits(reserve.underlyingBalance, reserve.reserve.decimals).gt(0);
  };

  const sortByReserveBalance = (a: ComputedUserReserve, b: ComputedUserReserve): number => {
    return parseFloat(b.underlyingBalanceETH) - parseFloat(a.underlyingBalanceETH);
  };

  return (
    <div>
      {userSummary && userSummary.reservesData ? (
        <div>
          {userSummary.reservesData
            .filter(reserveBalanceGtZero)
            .sort(sortByReserveBalance)
            .map((reserve: ComputedUserReserve) => {
              return (
                <UserReserveListItem
                  key={reserve.reserve.symbol}
                  reserveName={reserve.reserve.name}
                  reserveSymbol={reserve.reserve.symbol}
                  reserveAddress={reserve.reserve.underlyingAsset}
                  reserveAmount={reserve.underlyingBalance}
                />
              );
            })}
        </div>
      ) : (
        <UserReservesSkeleton />
      )}
    </div>
  );
}
