import OnboardingStepDescription from '_pages/Onboarding/OnboardingStepDescription';

export default function StepTermsAndConditions() {
  return (
    <OnboardingStepDescription>
      <span>
        By connecting a wallet, you agree to mello&apos;s{' '}
        <a target="_blank" rel="noreferrer" href="https://docs.mellodefi.com">
          Terms of Service
        </a>{' '}
        and acknowledge that you have read and understand the mello{' '}
        <a target="_blank" rel="noreferrer" href="https://docs.mellodefi.com/disclaimer">
          Disclaimer.
        </a>
      </span>
    </OnboardingStepDescription>
  );
}
