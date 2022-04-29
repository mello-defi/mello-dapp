import OnboardingStepDescription from '_pages/Onboarding/OnboardingStepDescription';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { checkForCouponAndRedeem } from '_services/couponService';

export default function StepConnectWallet() {
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const isOnboardingComplete = useSelector((state: AppState) => state.onboarding.complete);

  useEffect(() => {
    if (userAddress) {
      checkForCouponAndRedeem(userAddress, isOnboardingComplete);
    }
  }, [isOnboardingComplete, userAddress]);

  const whatIsRequired = (
    <>
      Connect or create a non-custodial wallet to use with mello.
      <br />A non-custodial wallet is a wallet where the user has
      <span className="font-bold"> full control </span>and{' '}
      <span className="font-bold">ownership</span> of their own funds.
      <br />
      <br />
      Click <span className="font-bold">&apos;Connect&apos; </span>in the top right of the screen
      and follow the instructions.
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
