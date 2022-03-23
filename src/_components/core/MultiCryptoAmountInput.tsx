import { EvmTokenDefinition } from '_enums/tokens';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { MarketDataResult } from '_services/marketDataService';
import TokenSelectDropdown from '_components/TokenSelectDropdown';
import { Spinner, SpinnerSize } from '_components/core/Animations';
import useWalletBalance from '_hooks/useWalletBalance';
import useMarketPrices from '_hooks/useMarketPrices';
import { BigNumber, ethers } from 'ethers';
import { decimalPlacesAreValid } from '_utils/index';

export default function MultiCryptoAmountInput({
  token,
  tokenChanged,
  amount,
  amountChanged,
  disabled,
  amountInFiat
}: {
  token?: EvmTokenDefinition;
  tokenChanged: (token: EvmTokenDefinition) => void;
  amount: string;
  amountChanged: (amount: string) => void;
  disabled: boolean;
  amountInFiat: number;
}) {
  const userBalance: BigNumber | undefined = useWalletBalance(token);
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
    if (userBalance) {
      let value = e.target.value;
      if (token && value && !decimalPlacesAreValid(value, token?.decimals)) {
        value = value.substring(0, value.length - 1);
      }
      if (
        value &&
        /^[0-9.]*$/.test(value) &&
        userBalance.lt(ethers.utils.parseUnits(value, token?.decimals))
      ) {
        value = ethers.utils.formatUnits(userBalance, token?.decimals);
      }
      if (parseFloat(value) < 0) {
        value = '0.0';
      }
      amountChanged(value);
    }
  };

  return (
    <div
      className={
        'rounded-2xl text-body-smaller transition border border-gray-50 bg-gray-100 px-2 sm:px-4 flex flex-col items-center justify-between hover:border-gray-200 transition mt-2'
      }
    >
      <div
        className={`flex flex-col sm:flex-row w-full items-center ${
          disabled ? 'text-gray-400 cursor-default' : ''
        }`}
      >
        <div className={'mr-2 w-full md:w-2/3'}>
          <input
            step={'0.01'}
            onWheel={() => false}
            type={'number'}
            disabled={disabled}
            // style={{fontFamily: 'monospace'}}
            className={`text-2xl font-mono sm:text-3xl w-full bg-gray-100 focus:outline-none px-2 sm:px-0 mt-2 sm:mt-0 py-1 sm:py-0 ${
              parseFloat(amount) === 0 ? 'text-gray-400' : 'text-gray-700'
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
      <div
        className={
          'flex flex-col items-start sm:items-center sm:flex-row my-3 sm:my-2 w-full justify-between text-color-light text-md'
        }
      >
        {tokenPrice ? (
          <div className={'text-left font-mono'}>
            ${amountInFiat.toLocaleString(undefined, { maximumFractionDigits: 6 })}
          </div>
        ) : (
          <span>&nbsp;</span>
        )}
        {token && (
          <div className={'text-right px-0 sm:px-1 flex-row-center'}>
            Balance:{' '}
            {userBalance ? (
              <div className={'font-mono ml-1'}>
                {ethers.utils.formatUnits(userBalance, token?.decimals)}
              </div>
            ) : (
              <span className={'ml-1'}>
                {token && <Spinner show={true} size={SpinnerSize.SMALL} />}
              </span>
            )}
            {userBalance && (
              <div
                onClick={() => {
                  amountChanged(ethers.utils.formatUnits(userBalance, token?.decimals));
                }}
                className={
                  'rounded-2xl text-body-smaller px-2 py-1 bg-gray-200 hover:bg-gray-300 transition ml-1 flex-row-center cursor-pointer'
                }
              >
                Max
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
