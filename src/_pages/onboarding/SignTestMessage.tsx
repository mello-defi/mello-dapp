import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { Button } from '_components/core/Buttons';
import { setStep } from '_redux/effects/onboardingEffects';

export default function SignTestMessage() {
  const signer = useSelector((state: AppState) => state.web3.signer);
  const currentStep = useSelector((state: AppState) => state.onboarding.currentStep);
  const dispatch = useDispatch();
  const signMessage = async () => {
    if (signer && currentStep) {
      await signer?.signMessage('Welcome to mello!');
      dispatch(setStep(currentStep?.nextStep));
    }
  };
  return (
    <div className={'flex justify-center mb-2'}>
      {signer && (
        <Button className={'w-full md:w-1/2'} onClick={signMessage}>
          Sign Message
        </Button>
      )}
    </div>
  );
}
