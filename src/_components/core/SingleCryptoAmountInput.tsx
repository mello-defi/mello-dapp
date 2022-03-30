import { formatTokenValueInFiat } from '_services/priceService';
import React, { useEffect } from 'react';
import { amountIsValidNumberGtZero, decimalPlacesAreValid } from '_utils/index';
import { TokenDefinition } from '_enums/tokens';
import { BigNumber, ethers } from 'ethers';
import { DefaultTransition } from '_components/core/Transition';
import MaxAmountButton from '_components/core/MaxAmountButton';
import { formatUnits, parseUnits } from 'ethers/lib/utils';

export default function SingleCryptoAmountInput({
  disabled,
  tokenPrice,
  amount,
  amountChanged,
  balance,
  token,
  maxAmount
}: {
  disabled: boolean;
  tokenPrice: number;
  amount: string;
  balance?: BigNumber;
  amountChanged: (amount: string) => void;
  token: TokenDefinition;
  maxAmount?: BigNumber;
}) {
  const [amountGreaterThanMax, setAmountGreaterThanMax] = React.useState(false);
  const handleAmountChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;
    if (token && value && !decimalPlacesAreValid(value, token.decimals)) {
      value = value.substring(0, value.length - 1);
    }
    if (parseFloat(value) < 0) {
      value = '0.0';
    }
    amountChanged(value);
  };

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
        <input
          disabled={disabled}
          onFocus={() => {
            if (amountIsValidNumberGtZero(amount)) {
              return;
            }
            amountChanged('');
          }}
          onWheel={(e) => e.currentTarget.blur()}
          type={'number'}
          min={'0'}
          className={`text-2xl w-3/5 font-mono sm:text-3xl bg-gray-100 focus:outline-none px-2 sm:px-0 sm:mt-0 py-1 sm:py-0 ${
            disabled ? 'text-gray-400' : 'text-color-dark'
          }`}
          value={amount}
          onChange={handleAmountChanged}
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
              {formatTokenValueInFiat(tokenPrice, amount)}
            </div>
          ) : (
            <span>&nbsp;</span>
          )}
        </div>
        {balance && BigNumber.from(balance).gt(0) && (
          <div className={'flex-row-center'}>
            <div>{formatUnits(balance, token.decimals)}</div>
            <MaxAmountButton
              onClick={() => amountChanged(formatUnits(balance, token?.decimals))}
            />
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
