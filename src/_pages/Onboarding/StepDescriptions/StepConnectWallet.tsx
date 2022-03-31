import OnboardingStepDescription from '_pages/Onboarding/OnboardingStepDescription';

export default function StepConnectWallet() {
  const whatIsRequired = (
    <>
      Connect or create a non-custodial wallet to use with mello.
      <br />
      Click &apos;Connect&apos; in the top right of the screen and follow the instructions.
    </>
  );

  const whyIsRequired = (
    <>A wallet is required to interact with the blockchain and access your assets.</>
  );

  const notes = (
    <>Store seed phrases and passwords securely, mello will never be able to access them!</>
  );

  return (
    <OnboardingStepDescription
      whatIsRequired={whatIsRequired}
      whyIsRequired={whyIsRequired}
      notes={notes}
    />
  );
}
