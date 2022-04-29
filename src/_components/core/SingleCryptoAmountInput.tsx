import { getTokenValueInFiat } from '_services/priceService';
import React, { useEffect, useState } from 'react';
import { amountIsValidNumberGtZero } from '_utils/index';
import { EvmTokenDefinition, GenericTokenDefinition } from '_enums/tokens';
import { BigNumber } from 'ethers';
import { DefaultTransition } from '_components/core/Transition';
import MaxAmountButton from '_components/core/MaxAmountButton';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import BaseCryptoInput from '_components/core/BaseCryptoInput';
import useMarketPrices from '_hooks/useMarketPrices';
import { getMarketDataForAdditionalSymbols } from '_services/marketDataService';

type AnyTokenType = EvmTokenDefinition | GenericTokenDefinition;

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
  token: AnyTokenType;
  maxAmount?: BigNumber;
  showMaxButton?: boolean;
}) {
  const [amountGreaterThanMax, setAmountGreaterThanMax] = useState(false);
  const [tokenPrice, setTokenPrice] = useState<number>();
  const marketPrices = useMarketPrices();

  const isEvmTokenType = (
    obj: EvmTokenDefinition | GenericTokenDefinition
  ): obj is EvmTokenDefinition => {
    return 'address' in obj;
  };

  useEffect(() => {
    const getPrice = async () => {
      if (token && marketPrices) {
        if (isEvmTokenType(token)) {
          const marketPrice = marketPrices[token.address.toLowerCase()];
          if (marketPrice) {
            setTokenPrice(marketPrice);
          }
        } else {
          const symbolPrices = await getMarketDataForAdditionalSymbols();
          const marketPrice = symbolPrices[token.symbol.toLowerCase()];
          if (marketPrice) {
            setTokenPrice(marketPrice);
          }
        }
      }
    };
    getPrice();
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
  }, [amount, maxAmount, token.decimals]);
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
          <img src={token.image} alt="token_image" className="flex-shrink-0 h-6 w-6 rounded-full" />
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
                onClick={() => amountChanged(formatUnits(balance, token.decimals))}
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
