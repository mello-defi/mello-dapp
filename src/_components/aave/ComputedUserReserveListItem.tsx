import { getFiatValueForUserReserve } from '_services/aaveService';
import React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import useMarketPrices from '_hooks/useMarketPrices';
import { findTokenByAddress } from '_utils/index';

export default function ComputedUserReserveListItem({
  reserveName,
  reserveSymbol,
  reserveAddress,
  reserveAmount
}: {
  reserveName: string;
  reserveSymbol: string;
  reserveAddress: string;
  reserveAmount: string;
}) {
  const tokenSet = useSelector((state: AppState) => state.web3.tokenSet);
  const marketPrices = useMarketPrices();
  return (
    <div key={reserveSymbol} className={'flex flex-row justify-between items-center mb-4 px-1'}>
      <div className={'flex-row-center'}>
        <img
          alt={reserveName}
          src={findTokenByAddress(tokenSet, reserveAddress).image}
          className={'w-5 h-5'}
        />
        <span className={'ml-2 text-body-smaller'}>
          {findTokenByAddress(tokenSet, reserveAddress).symbol}
        </span>
      </div>
      <div className={'flex flex-col font-mono'}>
        {marketPrices && (
          <span className={'text-body-smaller'}>
            {parseFloat(reserveAmount).toFixed(5)}
            <span className={'ml-1 text-color-light'}>
              ({getFiatValueForUserReserve(marketPrices, reserveAmount, reserveSymbol)})
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
