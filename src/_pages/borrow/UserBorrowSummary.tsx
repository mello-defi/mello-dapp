import { ComputedUserReserve } from '@aave/protocol-js/dist/v2/types';
import ComputedUserReserveListItem from '_components/aave/ComputedUserReserveListItem';
import React from 'react';
import useAaveUserSummary from '_hooks/useAaveUserSummary';
import UserReservesSkeleton from '_components/aave/UserReservesSkeleton';

export default function UserBorrowSummary() {
  const userSummary = useAaveUserSummary();
  return (
    <>
      {userSummary && userSummary.reservesData ? (
        userSummary.reservesData
          .filter(
            (reserve: ComputedUserReserve) =>
              parseFloat(parseFloat(reserve.totalBorrows).toFixed(18)) > 0
          )
          .sort(
            (a: ComputedUserReserve, b: ComputedUserReserve) =>
              parseFloat(b.totalBorrowsETH) - parseFloat(a.totalBorrowsETH)
          )
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
