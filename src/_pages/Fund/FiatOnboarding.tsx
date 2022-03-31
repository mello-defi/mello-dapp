import RampNetwork from '_components/onramps/RampNetwork';
import MtPelerin from '_components/onramps/MtPelerin';
import React from 'react';

export default function FiatOnboarding() {
  return (
    <div className={''}>
      <div className={'px-2 text-center'}>
        <span className={'text-body my-2'}>
          Use one of our partners to fund your account via bank transfer or credit/debit card
        </span>
      </div>
      <RampNetwork />
      <MtPelerin />
    </div>
  );
}
