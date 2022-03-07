import { OnboardingActionTypes, OnboardingStep } from '_redux/types/onboardingTypes';
import { Dispatch } from 'redux';
import { setCurrentStepAction } from '_redux/actions/onboardingActions';

export const setStep = (step: OnboardingStep | null) => {
  return function (dispatch: Dispatch<OnboardingActionTypes>) {
    console.log('SETTINGS TEP', step);
    if (step) {
      dispatch(setCurrentStepAction(step));
    }
  };
};
