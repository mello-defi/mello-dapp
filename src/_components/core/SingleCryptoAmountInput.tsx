import { formatTokenValueInFiat, getTokenValueInFiat } from '_services/priceService';
import React, { useEffect, useState } from 'react';
import { amountIsValidNumberGtZero, decimalPlacesAreValid } from '_utils/index';
import { TokenDefinition } from '_enums/tokens';
import { BigNumber, ethers } from 'ethers';
import { DefaultTransition } from '_components/core/Transition';
import MaxAmountButton from '_components/core/MaxAmountButton';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import BaseCryptoInput from '_components/core/BaseCryptoInput';
import { MarketDataResult } from '_services/marketDataService';
import useMarketPrices from '_hooks/useMarketPrices';

export default function SingleCryptoAmountInput({
  disabled,
  amount,
  amountChanged,
  balance,
  token,
  maxAmount,
  showMaxButton = true
}: {
  disabled: boolean;
  amount: string;
  balance?: BigNumber;
  amountChanged: (amount: string) => void;
  token: TokenDefinition;
  maxAmount?: BigNumber;
  showMaxButton?: boolean;
}) {
  const [amountGreaterThanMax, setAmountGreaterThanMax] = React.useState(false);
  const [tokenPrice, setTokenPrice] = useState<number>();
  const marketPrices = useMarketPrices();

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

  useEffect(() => {
    if (maxAmount) {
      if (amountIsValidNumberGtZero(amount)) {
        const amountBn = parseUnits(amount, token.decimals);
        setAmountGreaterThanMax(maxAmount !== undefined && maxAmount.lt(amountBn));
      } else {
        setAmountGreaterThanMax(false);
      }
    }
  }, [amount, maxAmount]);
  return (
    <div
      className={
        'rounded-2xl bg-gray-100 transition border-2 py-2 border-gray-50 bg-gray-50 px-2 sm:px-4 flex flex-col justify-between hover:border-gray-100 transition mt-2'
      }
    >
      <div
        className={`flex-row-center justify-between my-2 w-full
                ${disabled ? 'text-gray-400 cursor-default' : ''}
      `}
      >
        <BaseCryptoInput
          amount={amount}
          amountChanged={amountChanged}
          disabled={disabled}
          tokenDecimals={token.decimals}
        />
        <span className="flex-row-center max-w-2/5 items-center rounded-2xl bg-white px-4 py-2 justify-center">
          <img src={token.image} alt="person" className="flex-shrink-0 h-6 w-6 rounded-full" />
          <span className="ml-2 block truncate">{token.symbol}</span>
        </span>
      </div>
      <div
        className={'flex-row-center px-2 sm:px-1 justify-between text-body-smaller text-gray-500'}
      >
        <div>
          {tokenPrice ? (
            <div className={'text-left font-mono'}>
              $
              {getTokenValueInFiat(tokenPrice, amount).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6
              })}
            </div>
          ) : (
            <span>&nbsp;</span>
          )}
        </div>
        {balance && BigNumber.from(balance).gt(0) && (
          <div className={'flex-row-center'}>
            <div>{formatUnits(balance, token.decimals)}</div>
            {showMaxButton && (
              <MaxAmountButton
                onClick={() => amountChanged(formatUnits(balance, token?.decimals))}
              />
            )}
          </div>
        )}
      </div>
      <DefaultTransition isOpen={amountGreaterThanMax}>
        <div className={'flex-row-center text-body-smaller justify-end px-2'}>
          <span className={'text-red-400'}>Insufficient balance</span>
        </div>
      </DefaultTransition>
    </div>
  );
}
