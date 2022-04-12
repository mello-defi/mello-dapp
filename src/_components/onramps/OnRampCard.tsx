import React from 'react';
import { FiatCurrencySymbol } from '_enums/currency';
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';

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
  currencies: FiatCurrencySymbol[];
}) {
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  return (
    <div className={'relative'}>
      {!userAddress && (
        <div className={'absolute top-1/2 w-full'}>
          <span className={'text-2xl'}>Please connect your wallet to proceed</span>
        </div>
      )}
      <div
        className={`${
          !userAddress ? 'opacity-20 pointer-events-none' : ''
        } flex py-8 px-4 flex-col md:flex-row w-full justify-center items-center md:justify-evenly cursor-pointer rounded-lg hover:bg-gray-100 transition mb-4 border-2 border-gray-100`}
        onClick={onClick}
      >
        <img src={imageUrl} height={150} width={150} />
        <div className={'text-left text-color-dark md:text-right mt-2 md:mt-0'}>
          <span>{transferMethods}</span>
          {/*<span className={'text-color-light'}>*/}
          {/*  <br />*/}
          {/*  Fees: {fees}*/}
          {/*  <br />*/}
          {/*  Limits: {limits}*/}
          {/*  <br />*/}
          {/*  Currencies: {currencies.join(', ')}*/}
          {/*</span>*/}
        </div>
      </div>
    </div>
  );
}
