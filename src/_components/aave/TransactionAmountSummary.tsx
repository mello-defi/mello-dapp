import { formatTokenValueInFiat } from '_services/priceService';
import React from 'react';

export default function TransactionAmountSummary({
  amount,
  tokenPrice,
  title
}: {
  amount: number;
  tokenPrice: string | number;
  title: string;
}) {
  return (
    <span
      className={`my-1 bg-gray-100 px-2 py-2 rounded-xl ${amount === 0 ? 'text-gray-400' : ''}`}
    >
      <span className={`${amount === 0 ? '' : 'text-gray-500'}`}>{title}:</span>{' '}
      {formatTokenValueInFiat(tokenPrice, amount)}
    </span>
  );
}
