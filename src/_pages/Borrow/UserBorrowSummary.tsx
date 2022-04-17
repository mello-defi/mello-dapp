import { ComputedUserReserve } from '@aave/protocol-js/dist/v2/types';
import ComputedUserReserveListItem from '_components/aave/ComputedUserReserveListItem';
import React from 'react';
import useAaveUserSummary from '_hooks/useAaveUserSummary';
import UserReservesSkeleton from '_components/aave/UserReservesSkeleton';
import { parseUnits } from 'ethers/lib/utils';

export default function UserBorrowSummary() {
  const userSummary = useAaveUserSummary();

  const reserveBalanceGtZero = (reserve: ComputedUserReserve): boolean => {
    return parseUnits(reserve.underlyingBalance, reserve.reserve.decimals).gt(0);
  }

  const sortByReserveBorrows = (a: ComputedUserReserve, b: ComputedUserReserve): number => {
    return parseFloat(b.totalBorrowsETH) - parseFloat(a.totalBorrowsETH);
  }

  return (
    <>
      {userSummary && userSummary.reservesData ? (
        userSummary.reservesData
          .filter(reserveBalanceGtZero)
          .sort(sortByReserveBorrows)
          .map((reserve: ComputedUserReserve) => {
            return (
              <ComputedUserReserveListItem
                key={reserve.reserve.symbol}
                reserveName={reserve.reserve.name}
                reserveSymbol={reserve.reserve.symbol}
                reserveAddress={reserve.reserve.underlyingAsset}
                reserveAmount={reserve.totalBorrows}
              />
            );
          })
      ) : (
        <UserReservesSkeleton />
      )}
    </>
  );
}
