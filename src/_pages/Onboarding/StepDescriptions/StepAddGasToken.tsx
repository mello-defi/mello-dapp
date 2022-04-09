import OnboardingStepDescription from '_pages/Onboarding/OnboardingStepDescription';

export default function StepAddGasToken() {
  const whatIsRequired = <>Deposit or buy Matic for your wallet</>;
  const whyIsRequired = (
    <>
      A gas token is required to perform transactions on a blockchain. These fees are minuscule
      (~$.001) but without them, you can&apos;t authorise transactions.
      <br />
      <br />
      We reccomend you buy €5/$5 to start.
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
  const notes = <>We recommend Mt Pelerin for EU 🇪🇺 customers and Ramp for all non-EU customers</>;

  return (
    <OnboardingStepDescription
      whatIsRequired={whatIsRequired}
      whyIsRequired={whyIsRequired}
      notes={notes}
    />
  );
}
