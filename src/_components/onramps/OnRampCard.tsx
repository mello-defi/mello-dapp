import React from 'react';
import { FiatCurrencyName } from '_enums/currency';

export default function OnRampCard({
  imageUrl,
  onClick,
  transferMethods,
  fees,
  limits,
  currencies
}: {
  imageUrl: string;
  onClick: () => void;
  transferMethods: string;
  fees: string;
  limits: string;
  currencies: FiatCurrencyName[];
}) {
  return (
    <div
      className={
        'flex py-8 px-4 flex-col md:flex-row w-full justify-evenly cursor-pointer rounded-lg hover:bg-gray-300 transition mb-4 border-2 border-gray-100'
      }
      onClick={onClick}
    >
      <img src={imageUrl} height={150} width={150} />
      <div className={'text-left md:text-right mt-2 md:mt-0'}>
        <span>{transferMethods}</span>
        <span className={'text-gray-500'}>
          <br />
          Fees: {fees}
          <br />
          Limits: {limits}
          <br />
          Currencies: {currencies.join(', ')}
        </span>
      </div>
    </div>
  );
}
