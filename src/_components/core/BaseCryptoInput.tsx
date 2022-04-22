import { amountIsValidNumberGtZero, decimalPlacesAreValid, fixDecimalPlaces } from '_utils/index';
import React, { ChangeEvent, useEffect } from 'react';
import { formatUnits, parseUnits } from 'ethers/lib/utils';

export default function BaseCryptoInput({
  amount,
  amountChanged,
  disabled,
  tokenDecimals
}: {
  amount: string;
  amountChanged: (amount: string) => void;
  disabled: boolean;
  tokenDecimals: number;
}) {
  const handleAmountChanged = (value: string) => {
    console.log('DEcimals: ', tokenDecimals);
    console.log('Amount changed1: ' + value);
    if (value && !decimalPlacesAreValid(value, tokenDecimals)) {
      value = fixDecimalPlaces(value, tokenDecimals);
    }
    if (parseFloat(value) < 0) {
      value = '0.0';
    }
    console.log('AMOUNT CHANGEd2: ', value);
    amountChanged(value);
  };
  useEffect(() => {
    handleAmountChanged(amount);
  }, [tokenDecimals]);
  return (
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
        disabled ||
        (amount &&
          decimalPlacesAreValid(amount, tokenDecimals) &&
          parseUnits(amount, tokenDecimals).eq(0))
          ? 'text-gray-400'
          : 'text-color-dark'
      }`}
      value={amount}
      onChange={(e) => handleAmountChanged(e.target.value)}
    />
  );
}
