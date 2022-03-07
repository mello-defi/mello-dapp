import { OnboardingActionTypes, OnboardingStep } from '_redux/types/onboardingTypes';
import { Dispatch } from 'redux';
import { setCurrentStepAction } from '_redux/actions/onboardingActions';

export const setStep = (step: OnboardingStep) => {
  return function (dispatch: Dispatch<OnboardingActionTypes>) {
    dispatch(setCurrentStepAction(step));
  };
};
