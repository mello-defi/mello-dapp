import React, { useState } from 'react';
import { Button, ButtonSize, ButtonVariant } from '_components/core/Buttons';
import { DefaultTransition } from '_components/core/Transition';
import FiatOnboarding from '_pages/Fund/FiatOnboarding';
import CryptoOnboarding from '_pages/Fund/CryptoOnboarding';

export enum OnboardingSource {
  FIAT = 'FIAT',
  CRYPTO = 'CRYPTO'
}
export default function Fund() {
  const [onboardingSource, setOnboardingSource] = useState<OnboardingSource>();
  const [onboardingSourceSelected, setOnboardingSourceSelected] = useState<boolean>(false);
  const handleOnboardingSourceSelected = (source: OnboardingSource) => {
    setOnboardingSource(source);
    setOnboardingSourceSelected(true);
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
          {onboardingSource === OnboardingSource.FIAT && <FiatOnboarding />}
          {onboardingSource === OnboardingSource.CRYPTO && <CryptoOnboarding />}
        </div>
      </DefaultTransition>
    </div>
  );
}
