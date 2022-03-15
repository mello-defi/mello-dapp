import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { Button } from '_components/core/Buttons';
import { setStep } from '_redux/effects/onboardingEffects';
import { useEffect } from 'react';

export default function TermsAndConditions() {
  const currentStep = useSelector((state: AppState) => state.onboarding.currentStep);
  const dispatch = useDispatch();
  useEffect(() => {
    // if (currentStep.numbe) {
    //   dispatch(setStep('signTestMessage'));
    // }
  }, [currentStep]);
  const acceptTermsAndConditions = () => {
    if (currentStep) {
      dispatch(setStep(currentStep.nextStep));
    }
  }
  return (
    <div className={'flex flex-col items-center justify-center'}>
      <span className={'text-body-smaller mb-2'}>
        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?
      </span>
      <Button className={'w-full md:w-1/2'} onClick={acceptTermsAndConditions}>I accept</Button>
    </div>
  )
}