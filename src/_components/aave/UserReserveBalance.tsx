import { formatTokenValueInFiat } from '_services/priceService';
import React from 'react';
import { BigNumber, ethers } from 'ethers';

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
    <span className={'text-title text-left'}>
      <span className={'text-gray-500 mr-1'}>{title}:</span>
      {formattedUserAmount ? (
        <span>
          {formattedUserAmount}
          <span className={'text-gray-500 ml-2'}>
            ({formatTokenValueInFiat(tokenPrice, formattedUserAmount)})
          </span>
        </span>
      ) : (
        <span>0</span>
      )}
    </span>
  );
}
