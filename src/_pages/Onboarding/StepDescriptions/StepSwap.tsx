import OnboardingStepDescription from '_pages/Onboarding/OnboardingStepDescription';

export default function StepSwap() {
  const whatIsRequired = <>Swap some MATIC for WBTC</>;
  const whyIsRequired = (
    <>
      A token swap is the exchanging of one token for another. This allows you to easily exchange
      tokens when you require a token that you don&apos;t currently have.
      <br />
      <br />
      Learn more about token swaps{' '}
      <a
        target="_blank"
        rel="noreferrer"
        href="https://docs.mellodefi.com/introduction/onboarding/swap-tokens/"
      >
        here
      </a>
    </>
  );

  const notes = (
    <>
    We have prefilled the amount of MATIC that you can trade for WBTC. You can change this amount but remember to leave at least 1 MATIC for transaction fees.
    </>
  )
  return (
    <OnboardingStepDescription whatIsRequired={whatIsRequired} whyIsRequired={whyIsRequired} notes={notes} />
  );
}
