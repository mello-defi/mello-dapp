import { formatTokenValueInFiat } from '_services/priceService';
import React from 'react';

export default function TransactionAmountSummary({
  amount,
  tokenPrice,
  title
}: {
  amount: string;
  tokenPrice: string | number;
  title: string;
}) {
  return (
    <span className={`my-1 bg-gray-100 w-full px-2 py-2 rounded-2xl text-color-dark`}>
      <span className={`${parseFloat(amount) === 0 ? '' : 'text-color-light'}`}>{title}:</span>{' '}
      <span className={'font-mono'}>{formatTokenValueInFiat(tokenPrice, amount)}</span>
    </span>
  );
}
