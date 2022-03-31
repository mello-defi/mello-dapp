import { amountIsValidNumberGtZero, decimalPlacesAreValid } from '_utils/index';
import React, { ChangeEvent } from 'react';
import { formatUnits, parseUnits } from 'ethers/lib/utils';

export default function BaseCryptoInput({
  amount,
  amountChanged,
  disabled,
  tokenDecimals
}:
{
  amount: string;
  amountChanged: (amount: string) => void;
  disabled: boolean;
  tokenDecimals: number;
}) {

  const handleAmountChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;
    if (value && !decimalPlacesAreValid(value, tokenDecimals)) {
      value = value.substring(0, value.length - 1);
    }
    if (parseFloat(value) < 0) {
      value = '0.0';
    }
    amountChanged(value);
  };
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
        disabled || (amount && parseUnits(amount, tokenDecimals).eq(0)) ? 'text-gray-400' : 'text-color-dark'
      }`}
      value={amount}
      onChange={handleAmountChanged}
    />
  )
}