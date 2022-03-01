import { TokenDefinition } from '_enums/tokens';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { MarketDataResult } from '_services/marketDataService';
import TokenSelectDropdown from '_pages/swap/TokenSelectDropdown';
import { SwapSide } from 'paraswap-core';
import { Spinner, SpinnerSize } from '_components/core/Animations';
import useWalletBalance from '_hooks/useWalletBalance';
import useMarketPrices from '_hooks/useMarketPrices';

export default function SwapAmountInput({
  token,
  tokenChanged,
  amount,
  amountChanged,
  disabled,
  source,
  amountInFiat
}: {
  token?: TokenDefinition;
  tokenChanged: (token: TokenDefinition) => void;
  amount: number;
  amountChanged: (amount: number) => void;
  disabled: boolean;
  source: SwapSide;
  amountInFiat: number;
}) {
  const userBalance = useWalletBalance(token);
  const marketPrices = useMarketPrices();
  const [tokenPrice, setTokenPrice] = useState<number>();

  useEffect(() => {
    if (token && marketPrices) {
      const marketPrice = marketPrices.find(
        (item: MarketDataResult) =>
          item.symbol.toLocaleLowerCase() === token.symbol.toLocaleLowerCase()
      );
      if (marketPrice) {
        setTokenPrice(marketPrice.current_price);
      }
    }
  }, [token, marketPrices]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // if (!value) {
    //   value = '0';
    // }
    amountChanged(parseFloat(value));
  };

  return (
    <div
      className={
        'rounded-2xl transition border-2 border-gray-50 bg-gray-100 px-2 sm:px-4 flex flex-col items-center justify-between hover:border-gray-100 transition mt-2'
      }
    >
      <div
        className={`flex flex-col sm:flex-row w-full items-center ${
          disabled ? 'text-gray-400 cursor-default' : ''
        }`}
      >
        <div className={'mr-2 w-full md:w-2/3'}>
          <input
            type={'number'}
            disabled={disabled}
            className={`text-2xl sm:text-3xl bg-gray-100 focus:outline-none px-2 sm:px-0 mt-2 sm:mt-0 py-1 sm:py-0 ${
              amount === 0 ? 'text-gray-400' : ''
            }`}
            // value={Number(amount).toString() === '0' ? '0.0' : Number(amount).toString()}
            // value={Number(amount).toString()}
            value={amount}
            onChange={handleInputChange}
          />
        </div>
        <div className={'w-full md:w-1/3'}>
          <div className={'flex flex-col'}>
            <TokenSelectDropdown
              selectedToken={token}
              disabled={disabled}
              onSelectToken={tokenChanged}
            />
          </div>
        </div>
      </div>
      <div className={'flex flex-row my-3 sm:my-2 w-full justify-between text-gray-500 text-md'}>
        {tokenPrice ? (
          <div className={'text-left'}>
            ${amountInFiat.toLocaleString(undefined, { maximumFractionDigits: 6 })}
          </div>
        ) : (
          <span>&nbsp;</span>
        )}
        <div className={'text-right px-1 flex-row-center'}>
          Balance:{' '}
          {userBalance ? `${userBalance}` : <Spinner show={true} size={SpinnerSize.SMALL} />}
        </div>
      </div>
    </div>
  );
}
