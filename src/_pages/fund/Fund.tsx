import React from 'react';
import { CryptoCurrencyName } from '_enums/currency';
import { Button, ButtonSize, ButtonVariant } from '_components/core/Buttons';
import { DefaultTransition } from '_components/core/Transition';
import RampNetwork from '_components/onramps/RampNetwork';
import MtPellerin from '_components/onramps/MtPellerin';
import RenBridge from '_components/onramps/RenBridge';
import EthereumToPolygonBridge from '_components/onramps/EthereumToPolygonBridge';
import { btcLogo, ethLogo } from '_assets/images';
import FiatOnboarding from '_pages/fund/FiatOnboarding';

export enum OnboardingSource {
  FIAT = 'FIAT',
  CRYPTO = 'CRYPTO'
}

export enum CryptoSource {
  EXCHANGE = 'EXCHANGE',
  WALLET = 'WALLET'
}
export default function Fund() {
  const [onboardingSource, setOnboardingSource] = React.useState<OnboardingSource>();
  const [onboardingSourceSelected, setOnboardingSourceSelected] = React.useState<boolean>(false);
  const [cryptoSource, setCryptoSource] = React.useState<CryptoSource>();
  const [cryptoSourceSelected, setCryptoSourceSelected] = React.useState<boolean>(false);
  const [cryptoCurrency, setCryptoCurrency] = React.useState<CryptoCurrencyName>();
  const [cryptoCurrencySelected, setCryptoCurrencySelected] = React.useState<boolean>(false);
  const handleOnboardingSourceSelected = (source: OnboardingSource) => {
    setOnboardingSource(source);
    setOnboardingSourceSelected(true);
  };

  const handleCryptoSourceSelected = (source: CryptoSource) => {
    setCryptoSource(source);
    setCryptoSourceSelected(true);
  };

  const handleCryptoCurrencySelected = (currency: CryptoCurrencyName) => {
    setCryptoCurrency(currency);
    setCryptoCurrencySelected(true);
  };

  return (
    <div className={'rounded-2xl w-full text-center'}>
      <h4 className={'text-color-light hidden md:block'}>I want to transfer</h4>
      <h5 className={'text-color-light md:hidden'}>I want to transfer</h5>
      <div className={'flex flex-col mt-2'}>
        <Button
          className={`mb-2 ${onboardingSource === OnboardingSource.FIAT ? 'bg-gray-300' : ''}`}
          onClick={() => handleOnboardingSourceSelected(OnboardingSource.FIAT)}
          variant={ButtonVariant.SECONDARY}
          size={ButtonSize.LARGE}
        >
          Fiat currency
        </Button>
        <Button
          className={`mb-2 ${onboardingSource === OnboardingSource.CRYPTO ? 'bg-gray-300' : ''}`}
          onClick={() => handleOnboardingSourceSelected(OnboardingSource.CRYPTO)}
          variant={ButtonVariant.SECONDARY}
          size={ButtonSize.LARGE}
        >
          Cryptocurrency
        </Button>
      </div>
      <DefaultTransition isOpen={onboardingSourceSelected}>
        <div>
          {onboardingSource === OnboardingSource.FIAT && (
            <FiatOnboarding/>
          )}
          {onboardingSource === OnboardingSource.CRYPTO && (
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
          )}
        </div>
      </DefaultTransition>
    </div>
  );
}
