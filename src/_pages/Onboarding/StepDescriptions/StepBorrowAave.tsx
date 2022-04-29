import OnboardingStepDescription from '_pages/Onboarding/OnboardingStepDescription';

export default function StepBorrowAave() {
  const whatIsRequired = (
    <>
      Borrow USDC from Aave with a health factor<span className="font-bold"> greater than 2.</span>
    </>
  );
  const whyIsRequired = (
    <>
      Now that you have supplied WBTC as collateral, you can now borrow against it.
      <br />
      <br />
      Learn more about Aave{' '}
      <a
        target="_blank"
        rel="noreferrer"
        href="https://docs.mellodefi.com/introduction/onboarding/borrow-using-aave/"
      >
        here
      </a>
    </>
  );
  return (
    <OnboardingStepDescription whatIsRequired={whatIsRequired} whyIsRequired={whyIsRequired} />
  );
}
