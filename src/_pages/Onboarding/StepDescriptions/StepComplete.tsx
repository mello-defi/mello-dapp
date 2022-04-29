import OnboardingStepDescription from '_pages/Onboarding/OnboardingStepDescription';
import React from 'react';
import { MELLO_DISCORD_URL } from '_constants/urls';

export default function StepComplete() {
  return (
    <OnboardingStepDescription>
      <p>
        Congratulations, you have completed the mello onboarding tutorial. This tutorial was
        designed to show you all the basics required to use DeFi
        <br />
        <br />
        Have a question or provide feedback?{' '}
        <a className={'text-orange'} href={MELLO_DISCORD_URL}>
          Join our Discord
        </a>{' '}
        <br />
        <br />
        Documentation is always available{' '}
        <a target="_blank" rel="noreferrer" href="https://docs.mellodefi.com/">
          here
        </a>
      </p>
    </OnboardingStepDescription>
  );
}
