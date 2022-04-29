import OnboardingStepDescription from '_pages/Onboarding/OnboardingStepDescription';

export default function StepDepositAave() {
  const whatIsRequired = <>Supply your newly swapped WBTC into the Aave lending protocol</>;
  const whyIsRequired = (
    <>
      By supplying your tokens into Aave you can passively earn interest, and use deposits as
      collateral to take out loans.
      <br />
      <br />
      <>
        Click <span className="font-bold">Max</span> to add all of the WBTC you bought on the
        previous step.
      </>
      <br />
      <br />
      Learn more about Aave{' '}
      <a
        target="_blank"
        rel="noreferrer"
        href="https://docs.mellodefi.com/introduction/onboarding/deposit-into-aave/"
      >
        here.
      </a>
    </>
  );
  return (
    <OnboardingStepDescription whatIsRequired={whatIsRequired} whyIsRequired={whyIsRequired} />
  );
}
