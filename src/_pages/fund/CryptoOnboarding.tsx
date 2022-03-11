import { Button, ButtonSize, ButtonVariant } from '_components/core/Buttons';
import { CryptoCurrencyName } from '_enums/currency';
import { btcLogo, ethLogo } from '_assets/images';
import { DefaultTransition } from '_components/core/Transition';
import RenBridge from '_components/onramps/RenBridge';
import EthereumToPolygonBridge from '_components/onramps/EthereumToPolygonBridge';
import React, { useState } from 'react';

export enum CryptoSource {
  EXCHANGE = 'EXCHANGE',
  WALLET = 'WALLET'
}
export default function CryptoOnboarding() {
  const [cryptoCurrency, setCryptoCurrency] = useState<CryptoCurrencyName>();
  const [cryptoCurrencySelected, setCryptoCurrencySelected] = useState<boolean>(false);
  const handleCryptoCurrencySelected = (currency: CryptoCurrencyName) => {
    setCryptoCurrency(currency);
    setCryptoCurrencySelected(true);
  };
  return (
    <div className={''}>
      <h4>My cryptocurrency is</h4>
      <div className={'flex flex-col mt-2 justify-between'}>
        <Button
          className={`mb-2 items-center w-full ${
            cryptoCurrency === CryptoCurrencyName.BITCOIN ? 'bg-gray-300' : ''
          }`}
          onClick={() => handleCryptoCurrencySelected(CryptoCurrencyName.BITCOIN)}
          variant={ButtonVariant.SECONDARY}
          size={ButtonSize.LARGE}
        >
          <div className={'flex-row-center justify-center'}>
            <img height={30} width={30} src={btcLogo} alt={'bitcoin'} className={'mr-2'} />
            Bitcoin
          </div>
        </Button>
        <Button
          className={`mb-2 items-center w-full ${
            cryptoCurrency === CryptoCurrencyName.ETHEREUM ? 'bg-gray-300' : ''
          }`}
          onClick={() => handleCryptoCurrencySelected(CryptoCurrencyName.ETHEREUM)}
          variant={ButtonVariant.SECONDARY}
          size={ButtonSize.LARGE}
        >
          <div className={'flex-row-center justify-center'}>
            <img height={30} width={30} src={ethLogo} alt={'ethereum'} className={'mr-2'} />
            Ethereum
          </div>
        </Button>
      </div>
      <DefaultTransition isOpen={cryptoCurrencySelected}>
        <div>
          {cryptoCurrency === CryptoCurrencyName.BITCOIN && (
            <div>
              <RenBridge />
            </div>
          )}
          {cryptoCurrency === CryptoCurrencyName.ETHEREUM && (
            <div>
              <EthereumToPolygonBridge />
            </div>
          )}
        </div>
      </DefaultTransition>
    </div>
  );
}
