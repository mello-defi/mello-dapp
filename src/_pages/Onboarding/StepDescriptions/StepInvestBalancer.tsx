import OnboardingStepDescription from '_pages/Onboarding/OnboardingStepDescription';

export default function StepInvestBalancer() {
  const whatIsRequired = <>Invest your $USDC loan into the Balancer investment pool</>;
  const whyIsRequired = (
    <>
      By investing your tokens into Balancer investment pools you can earn APR% on those tokens.
      <br />
      Learn more about Balancer <a href={'https://docs.mellodefi.com/invest'}>here</a>.
    </>
  );
  return (
    <OnboardingStepDescription whatIsRequired={whatIsRequired} whyIsRequired={whyIsRequired} />
  );
}
