import RampNetwork from '_components/onramps/RampNetwork';
import MtPellerin from '_components/onramps/MtPellerin';
import React from 'react';

export default function FiatOnboarding() {
  return (
    <div>
      <span className={'text-body px-2 my-2'}>
        Use one of our partners to fund your account via bank transfer or credit/debit card
      </span>
      <RampNetwork />
      <MtPellerin />
    </div>
  );
}
