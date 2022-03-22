import OnboardingStepDescription from '_pages/Onboarding/OnboardingStepDescription';

export default function StepSignMessage() {
  const whatIsRequired = <>Sign a test transaction</>;
  const whyIsRequired = (
    <>
      In order to authorize transactions from your crypto wallet, you have to sign them via a popup
      window. Please click the button below to sign a test transaction
    </>
  );
  const notes = (
    <>
      This transaction doesn&apos;t incur a gas fee. However, in future signing transactions will
      incur gas fees that are paid for in the network&apos;s native token
    </>
  );

  return (
    <OnboardingStepDescription
      whatIsRequired={whatIsRequired}
      whyIsRequired={whyIsRequired}
      notes={notes}
    />
  );
}
