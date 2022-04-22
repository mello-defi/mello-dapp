import OnboardingStepDescription from '_pages/Onboarding/OnboardingStepDescription';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { checkForCouponAndRedeem } from '_services/checkForCoupon';

export default function StepConnectWallet() {
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const isOnboardingComplete = useSelector((state: AppState) => state.onboarding.complete);
  const [couponMessage, setCouponMessage] = useState(false);

  useEffect(() => {
    if (userAddress) {
      const check = async () => {
        const isCoupounOnTheWay = await checkForCouponAndRedeem(userAddress, isOnboardingComplete);
        setCouponMessage(isCoupounOnTheWay);
      };
      check();
    }
  }, [userAddress]);

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
