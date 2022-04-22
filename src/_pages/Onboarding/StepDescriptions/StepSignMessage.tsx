import OnboardingStepDescription from '_pages/Onboarding/OnboardingStepDescription';

export default function StepSignMessage() {
  const whatIsRequired = <>Sign a free test transaction.</>;
  const whyIsRequired = (
    <>
      In order to authorize transactions from your crypto wallet, you have to sign them via a popup
      window. Please click the button below to sign a free test transaction. Many DeFi applications
      do this so the user can prove that they are in control of a wallet address.
    </>
  );
  const notes = (
    <>
      This transaction doesn&apos;t incur a gas fee. However, in future, transactions will incur gas
      fees that are paid for in the network&apos;s native token.
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
