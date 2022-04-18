// import { getFiatValueForUserReserve } from '_services/aaveService';
import React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import useMarketPrices from '_hooks/useMarketPrices';
import { getTokenByAddress } from '_utils/index';
import CryptoAmountWithTooltip from '_components/core/CryptoAmountTooltip';
import { parseUnits } from 'ethers/lib/utils';
import { formatTokenValueInFiat } from '_services/priceService';

export default function UserReserveListItem({
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
  const token = getTokenByAddress(tokenSet, reserveAddress);
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
              amount={parseUnits(reserveAmount, token.decimals).toString()}
            />
            <span className={'ml-1 text-color-light'}>
              ({formatTokenValueInFiat(marketPrices[reserveAddress.toLowerCase()], reserveAmount)})
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
