import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { Button } from '_components/core/Buttons';
import { setStep } from '_redux/effects/onboardingEffects';
import { useEffect, useState } from 'react';

export default function TermsAndConditions() {
  const currentStep = useSelector((state: AppState) => state.onboarding.currentStep);
  const [accepted, setAccepted] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    // if (currentStep.numbe) {
    //   dispatch(setStep('signTestMessage'));
    // }
  }, [currentStep]);
  const acceptTermsAndConditions = () => {
    if (currentStep) {
      setAccepted(true)
      dispatch(setStep(currentStep + 1));
    }
  };
  return (
    <div className={'flex flex-col items-center justify-center'}>
      {!accepted &&
        <Button className={'w-full md:w-1/2'} onClick={acceptTermsAndConditions}>
        Accept
      </Button>}      
    </div>
  );
}
