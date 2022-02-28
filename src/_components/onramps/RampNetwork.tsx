import React from 'react';
import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';
import OnRampCard from './OnRampCard';
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { FiatCurrencyName } from '_enums/currency';
import { rampNetworkLogo } from '_assets/images';

function RampNetwork() {
  const provider = useSelector((state: AppState) => state.web3.provider);
  const openWidget = async () => {
    const signer = provider?.getSigner();
    const userAddress = await signer?.getAddress();
    new RampInstantSDK({
      hostAppName: 'Mello',
      hostLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Headspace-logo.jpg',
      fiatCurrency: 'EUR',
      defaultAsset: 'MATIC',
      fiatValue: '100',
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
