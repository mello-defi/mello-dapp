import React from 'react';
import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { FiatCurrencyName } from '_enums/currency';
import { melloLogoFace, rampNetworkLogo } from '_assets/images';
import OnRampCard from '_components/onramps/OnRampCard';

function RampNetwork() {
  // const provider = useSelector((state: AppState) => state.web3.provider);
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const openWidget = async () => {
    new RampInstantSDK({
      hostAppName: 'mello',
      hostLogoUrl: melloLogoFace,
      fiatCurrency: 'EUR',
      defaultAsset: 'MATIC',
      fiatValue: '10',
      userAddress: userAddress
      // url: 'https://ri-widget-staging.firebaseapp.com',
      // webhookStatusUrl: 'https://ea14-80-233-33-216.ngrok.io/'
    })
      .on('*', (event) => console.log(event))
      .show();
  };

  return (
    <OnRampCard
      transferMethods={'Bank transfer, credit/debit card, Apple Pay'}
      imageUrl={rampNetworkLogo}
      fees={'0.49%-2.9%'}
      limits={'10,000 EUR per month'}
      currencies={[FiatCurrencyName.EUR, FiatCurrencyName.GBP, FiatCurrencyName.USD]}
      onClick={openWidget}
    />
  );
}

export default RampNetwork;
