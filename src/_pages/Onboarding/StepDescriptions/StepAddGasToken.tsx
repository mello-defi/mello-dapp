import OnboardingStepDescription from '_pages/Onboarding/OnboardingStepDescription';

export default function StepAddGasToken() {
  const whatIsRequired = <>Deposit some $MATIC into your wallet</>;
  const whyIsRequired = (
    <>
      Gas is required to perform transactions on the Polygon network. These fees are minuscule
      (~$.001) but without them, you can&apos;t authorise transactions. mello recommends keeping $5
      worth of $MATIC in your wallet at all times.
      <br />
      <br />
      Learn more about gas tokens{' '}
      <a
        target="_blank"
        rel="noreferrer"
        href="https://docs.mellodefi.com/introduction/onboarding/add-gas-to-wallet/"
      >
        here
      </a>
    </>
  );
  const notes = <>We recommend Mt Pelerin for EU customers and Ramp for all non-EU customers</>;

  return (
    <OnboardingStepDescription
      whatIsRequired={whatIsRequired}
      whyIsRequired={whyIsRequired}
      notes={notes}
    />
  );
}
