import { ComputedUserReserve } from '@aave/protocol-js/dist/v2/types';
import ComputedUserReserveListItem from '_components/aave/ComputedUserReserveListItem';
import React from 'react';
import useAaveUserSummary from '_hooks/useAaveUserSummary';
import UserReservesSkeleton from '_components/aave/UserReservesSkeleton';

export default function UserDepositSummary() {
  const userSummary = useAaveUserSummary();
  return (
    <div>
      {userSummary && userSummary.reservesData ? (
        <div>
          {userSummary.reservesData
            .filter(
              (reserve: ComputedUserReserve) =>
                parseFloat(parseFloat(reserve.underlyingBalance).toFixed(18)) > 0
            )
            .sort((a, b) => parseFloat(b.underlyingBalanceETH) - parseFloat(a.underlyingBalanceETH))
            .map((reserve: ComputedUserReserve) => {
              return (
                <ComputedUserReserveListItem
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
