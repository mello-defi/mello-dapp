import { getFiatValueForUserReserve } from '_services/aaveService';
import React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import useMarketPrices from '_hooks/useMarketPrices';
import { findTokenByAddress } from '_utils/index';
import CryptoAmountWithTooltip from '_components/core/CryptoAmountTooltip';
import { ethers } from 'ethers';

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
  // const getAmount = (): string => {
  //   const amount = parseFloat(reserveAmount);
  //   if (amount < 0.000001) {
  //     return '<0.000001';
  //   }
  //   return amount.toFixed(6);
  // };
  const token = findTokenByAddress(tokenSet, reserveAddress);
  return (
    <div key={reserveSymbol} className={'flex flex-row justify-between items-center mb-4 px-1'}>
      <div className={'flex-row-center'}>
        <img alt={reserveName} src={token.image} className={'w-5 h-5'} />
        <span className={'ml-2 text-body-smaller'}>{token.symbol}</span>
      </div>
      <div className={'flex flex-col font-mono'}>
        {marketPrices && (
          <span className={'text-body-smaller flex-row-center'}>
            <CryptoAmountWithTooltip
              showSymbol={false}
              token={token}
              amount={ethers.utils.parseUnits(reserveAmount, token.decimals).toString()}
            />
            <span className={'ml-1 text-color-light'}>
              ({getFiatValueForUserReserve(marketPrices, reserveAmount, reserveSymbol)})
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
