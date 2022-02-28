import React from 'react';
import OnRampCard from '_components/onramps/OnRampCard';
import { FiatCurrencyName } from '_enums/currency';
import { mtPellerinLogo } from '_assets/images';

declare global {
  interface Window {
    showMtpModal: any;
  }
}

function MtPellerin() {
  const openWidget = () => {
    window.showMtpModal({
      lang: 'en',
      tab: 'buy',
      nets: 'matic_mainnet',
      crys: 'jEUR,MATIC,USDC,WBTC,DAI,WETH',
      net: 'matic_mainnet',
      // primary: '#ff9101',
      bsc: 'EUR',
      bdc: 'jEUR'
    });
  };

  return (
    <OnRampCard
      transferMethods={'Bank transfer, credit/debit card'}
      imageUrl={mtPellerinLogo}
      fees={'0%-1.3%'}
      limits={'100,000 EUR per year'}
      currencies={[FiatCurrencyName.EUR, FiatCurrencyName.GBP, FiatCurrencyName.USD]}
      onClick={openWidget}
    />
  );
}

export default MtPellerin;
