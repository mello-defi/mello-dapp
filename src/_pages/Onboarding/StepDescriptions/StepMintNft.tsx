import OnboardingStepDescription from '_pages/Onboarding/OnboardingStepDescription';

export default function StepMintNft() {
  const whatIsRequired = <>Mint your course completion NFT</>;
  const whyIsRequired = (
    <>
      This NFT will prove you have completed the onboarding so won&apos;t have to do it again in
      future.
      <br />
      <br />
      View the NFT here
    </>
  );
  return (
    <OnboardingStepDescription whatIsRequired={whatIsRequired} whyIsRequired={whyIsRequired} />
  );
}
