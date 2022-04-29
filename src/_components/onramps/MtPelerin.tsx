import React from 'react';
import OnRampCard from '_components/onramps/OnRampCard';
import { FiatCurrencySymbol } from '_enums/currency';
import { mtPelerinLogo } from '_assets/images';
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';

declare global {
  interface Window {
    showMtpModal: any;
  }
}
function MtPelerin() {
  const address = useSelector((state: AppState) => state.wallet.address);
  const signer = useSelector((state: AppState) => state.web3.signer);

  const openWidget = async () => {
    if (signer) {
      const code = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
      const message = `MtPelerin-${code}`;
      const signingHash = await signer.signMessage(message);
      const properHash = Buffer.from(signingHash.replace('0x', ''), 'hex').toString('base64');

      window.showMtpModal({
        lang: 'en',
        tab: 'buy',
        nets: 'matic_mainnet',
        crys: 'jEUR,MATIC,USDC,WBTC,DAI,WETH',
        net: 'matic_mainnet',
        bsc: 'EUR',
        bdc: 'jEUR',
        addr: address,
        code,
        hash: properHash
      });
    }
  };

  return (
    <OnRampCard
      transferMethods={'Bank transfer, credit/debit card'}
      imageUrl={mtPelerinLogo}
      fees={'0%-1.3%'}
      limits={'100,000 EUR per year'}
      currencies={[FiatCurrencySymbol.EUR, FiatCurrencySymbol.GBP, FiatCurrencySymbol.USD]}
      onClick={openWidget}
    />
  );
}

export default MtPelerin;
