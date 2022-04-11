import FiatOnboarding from '_pages/Fund/FiatOnboarding';
import { useState } from 'react';
import { Button, ButtonVariant } from '_components/core/Buttons';
import ReceiveCrypto from '_pages/Wallet/ReceiveCrypto';

enum FundSource {
  Fiat = 'fiat',
  Crypto = 'crypto',
}
export default function AddGasToWallet() {
  // const [source, setSource] = useState<string>('');
  const [fundSource, setFundSource] = useState<FundSource>();
  return (
    <div>
      <div className={'flex flex-col md:flex-row items-center space-x-0 md:space-x-2 space-y-2 md:space-y-0'}>
        <Button className={'w-full md:w-1/2'} variant={ButtonVariant.SECONDARY} onClick={() => setFundSource(FundSource.Fiat)}>Fund with card/bank transfer</Button>
        <Button className={'w-full md:w-1/2'} variant={ButtonVariant.SECONDARY} onClick={() => setFundSource(FundSource.Crypto)}>Fundstep with crypto</Button>
      </div>
      <div className={'mt-2'}>
        {fundSource === FundSource.Fiat && <FiatOnboarding/>}
        {fundSource === FundSource.Crypto && <ReceiveCrypto/>}
      </div>
    </div>
  );
}