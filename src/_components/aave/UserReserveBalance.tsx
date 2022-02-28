import { formatTokenValueInFiat } from '_services/priceService';
import React from 'react';

export default function UserReserveBalance({
  title,
  userBalance,
  tokenPrice
}: {
  title: string;
  userBalance?: string;
  tokenPrice: string | number;
}) {
  return (
    <span className={'text-title text-left'}>
      <span className={'text-gray-500 mr-1'}>{title}:</span>
      {userBalance ? (
        <span>
          {parseFloat(userBalance).toLocaleString(undefined, { maximumFractionDigits: 6 })}
          <span className={'text-gray-500 ml-2'}>
            ({formatTokenValueInFiat(tokenPrice, userBalance)})
          </span>
        </span>
      ) : (
        <span>0</span>
      )}
    </span>
  );
}
