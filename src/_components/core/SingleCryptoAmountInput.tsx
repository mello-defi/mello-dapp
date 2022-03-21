import { formatTokenValueInFiat } from '_services/priceService';
import React from 'react';
import { decimalPlacesAreValid } from '_utils/index';
import { EvmTokenDefinition, TokenDefinition } from '_enums/tokens';

export default function SingleCryptoAmountInput ({disabled, tokenPrice, amount, amountChanged, token}: {disabled: boolean, tokenPrice: number, amount: string, amountChanged: (amount: string) => void, token: TokenDefinition}) {

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
  return (
    <div
      className={
        'rounded-2xl bg-gray-100 transition border-2 py-2 border-gray-50 bg-gray-50 px-2 sm:px-4 flex flex-col justify-between hover:border-gray-100 transition mt-2'
      }
    >
      <div className={'flex-row-center justify-between my-2'}>
        <div>
          <input
            disabled={disabled}
            onWheel={() => false}
            type={'number'}
            min={'0'}
            className={`text-2xl sm:text-3xl bg-gray-100 focus:outline-none px-2 sm:px-0 sm:mt-0 py-1 sm:py-0 w-full ${
              disabled ? 'text-gray-400' : 'text-color-dark'
            }`}
            value={amount}
            onChange={handleAmountChanged}
          />
        </div>
        <span className="flex-row-center rounded-2xl bg-white px-4 py-2">
          <img
            src={token.image}
            alt="person"
            className="flex-shrink-0 h-6 w-6 rounded-full"
          />
          <span className="ml-2 block truncate">{token.symbol}</span>
        </span>
      </div>
      <div className={'text-body-smaller text-gray-500'}>
        {tokenPrice ? (
          <div className={'text-left'}>
            {formatTokenValueInFiat(tokenPrice, amount)}
          </div>
        ) : (
          <span>&nbsp;</span>
        )}
      </div>
    </div>
  )
}