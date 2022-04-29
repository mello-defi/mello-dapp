import React, { useState } from 'react';
import {
  RampInstantEvents,
  RampInstantEventTypes,
  RampInstantSDK
} from '@ramp-network/ramp-instant-sdk';
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { rampNetworkLogo } from '_assets/images';
import OnRampCard from '_components/onramps/OnRampCard';
import { formatUnits } from 'ethers/lib/utils';
import { CheckCircle } from '@mui/icons-material';
import { FiatCurrencySymbol } from '_enums/currency';

function RampNetwork() {
  const [cryptoAmount, setCryptoAmount] = useState(0.22);
  const [cryptoSymbol, setCryptoSymbol] = useState('MATIC');
  const [fiatAmount, setFiatAmount] = useState(10.2);
  const [fiatCurrency, setFiatCurrency] = useState('EUR');
  const [lastRampEvent, setLastRampEvent] = useState<RampInstantEventTypes>();
  const [hasPurchaseHappened, setHasPurchaseHappened] = useState(false);
  const handleRampEvent = (event: RampInstantEvents) => {
    console.log(event);
    switch (event.type) {
      case RampInstantEventTypes.PURCHASE_CREATED:
        setLastRampEvent(RampInstantEventTypes.PURCHASE_CREATED);
        setFiatAmount(
          parseFloat(event.payload.purchase.fiatValue) -
            parseFloat(event.payload.purchase.appliedFee)
        );
        setFiatCurrency(event.payload.purchase.fiatCurrency);
        setCryptoAmount(
          parseFloat(
            formatUnits(
              event.payload.purchase.cryptoAmount,
              event.payload.purchase.asset.decimals
            ).toString()
          )
        );
        setCryptoSymbol(event.payload.purchase.asset.symbol);
        setHasPurchaseHappened(true);
        break;
      case RampInstantEventTypes.WIDGET_CLOSE:
      case RampInstantEventTypes.PURCHASE_SUCCESSFUL:
        setLastRampEvent(event.type);
        break;
      default:
        break;
    }
  };
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const openWidget = async () => {
    new RampInstantSDK({
      variant: 'auto',
      hostAppName: 'mello',
      hostLogoUrl:
        'https://storageapi2.fleek.co/12c7096b-d75e-4ca8-be93-7ddf73131ef3-bucket/full icon + name slim-dark.svg',
      fiatCurrency: 'EUR',
      defaultAsset: 'MATIC',
      fiatValue: '6.25',
      userAddress: userAddress
      // url: 'https://ri-widget-staging-goerli2.firebaseapp.com/'
    })
      .on('*', handleRampEvent)
      .show();
  };

  return (
    <div>
      <OnRampCard
        transferMethods={'Bank transfer, credit/debit card, Apple Pay'}
        imageUrl={rampNetworkLogo}
        fees={'0.49%-2.9%'}
        limits={'10,000 EUR per month'}
        currencies={[FiatCurrencySymbol.EUR, FiatCurrencySymbol.GBP, FiatCurrencySymbol.USD]}
        onClick={openWidget}
      />
      {lastRampEvent === RampInstantEventTypes.WIDGET_CLOSE && hasPurchaseHappened ? (
        <div className={'text-body text-black rounded-2xl bg-gray-100 px-4 py-4 flex-row-center '}>
          <div className={'text-3xl mr-2'}>
            <CheckCircle className={'text-gray-400 mb-1'} fontSize={'inherit'} />
          </div>
          <h3>
            If your purchase was successful, you will receive{' '}
            <span className={'font-semibold'}>
              {cryptoAmount.toFixed(6)} {cryptoSymbol}
            </span>{' '}
            for{' '}
            <span className={'font-semibold'}>
              {fiatAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}{' '}
              {fiatCurrency}
            </span>
            .
            <br />
            It should arrive in your wallet in the next few minutes, please stay on this page
          </h3>
        </div>
      ) : null}
    </div>
  );
}

export default RampNetwork;
