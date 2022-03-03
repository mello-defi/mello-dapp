import { formatTokenValueInFiat } from '_services/priceService';
import React from 'react';

export default function UserReserveBalance({
  title,
  formattedUserAmount,
  tokenPrice
}: {
  title: string;
  formattedUserAmount?: string;
  tokenPrice: string | number;
}) {
  return (
    <span className={'text-body text-left'}>
      <span className={'text-color-light mr-1'}>{title}:</span>
      {formattedUserAmount ? (
        <span className={'font-mono'}>
          {formattedUserAmount}
          <span className={'text-color-light ml-2'}>
            ({formatTokenValueInFiat(tokenPrice, formattedUserAmount)})
          </span>
        </span>
      ) : (
        <span>0</span>
      )}
    </span>
  );
}
