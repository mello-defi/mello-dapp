import { EvmTokenDefinition } from '_enums/tokens';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { MarketDataResult } from '_services/marketDataService';
import TokenSelectDropdown from '_components/TokenSelectDropdown';
import { Spinner, SpinnerSize } from '_components/core/Animations';
import useWalletBalances from '_hooks/useWalletBalances';
import useMarketPrices from '_hooks/useMarketPrices';
import { BigNumber, ethers } from 'ethers';
import { amountIsValidNumberGtZero, decimalPlacesAreValid } from '_utils/index';
import MaxAmountButton from '_components/core/MaxAmountButton';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import BaseCryptoInput from '_components/core/BaseCryptoInput';
import { DefaultTransition } from '_components/core/Transition';

export default function MultiCryptoAmountInput({
  token,
  tokenChanged,
  amount,
  amountChanged,
  disabled,
  amountInFiat,
  allowAmountOverMax = true,
}: {
  token?: EvmTokenDefinition;
  tokenChanged: (token: EvmTokenDefinition) => void;
  amount: string;
  amountChanged: (amount: string) => void;
  disabled: boolean;
  amountInFiat: number;
  allowAmountOverMax?: boolean;
}) {

  const [amountGreaterThanUserBalance, setAmountGreaterThanUserBalance] = React.useState(false);
  const [userTokenBalance, setUserTokenBalance] = useState<BigNumber | undefined>();
  const marketPrices = useMarketPrices();
  const walletBalances = useWalletBalances();

  useEffect(() => {
    if (!allowAmountOverMax && userTokenBalance && token) {
      if (amountIsValidNumberGtZero(amount)) {
        const amountBn = parseUnits(amount, token.decimals);
        setAmountGreaterThanUserBalance(userTokenBalance.lt(amountBn));
      } else {
        setAmountGreaterThanUserBalance(false);
      }
    }
  }, [amount, userTokenBalance, token]);

  useEffect(() => {
    if (token) {
      setUserTokenBalance(walletBalances[token.symbol]?.balance);
    }
  }, [walletBalances, token]);
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

  return (
    <div
      className={
        'rounded-2xl text-body-smaller transition border border-gray-50 bg-gray-100 px-2 sm:px-4 flex flex-col items-end justify-between hover:border-gray-200 transition mt-2'
      }
    >
      <div
        className={`flex flex-col sm:flex-row w-full items-center ${
          disabled ? 'text-gray-400 cursor-default' : ''
        }`}
      >
        <div className={'mr-2 w-full md:w-2/3'}>
          {token && (
            <BaseCryptoInput amount={amount} amountChanged={amountChanged} disabled={disabled} tokenDecimals={token.decimals}/>
          )}
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
            {userTokenBalance ? (
              <div className={'font-mono ml-1'}>{formatUnits(userTokenBalance, token?.decimals)}</div>
            ) : (
              <span className={'ml-1'}>
                {token && <Spinner show={true} size={SpinnerSize.SMALL} />}
              </span>
            )}
            {userTokenBalance && (
              <MaxAmountButton
                onClick={() => amountChanged(formatUnits(userTokenBalance, token?.decimals))}
              />
            )}
          </div>
        )}
      </div>
      <DefaultTransition isOpen={amountGreaterThanUserBalance && !allowAmountOverMax}>
        <div className={'flex-row-center text-body-smaller justify-end px-2 pb-2'}>
          <span className={'text-red-400'}>Insufficient balance</span>
        </div>
      </DefaultTransition>
    </div>
  );
}
