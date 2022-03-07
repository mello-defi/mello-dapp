import { OnboardingActionTypes, OnboardingStep, SET_STEP } from '_redux/types/onboardingTypes';

export const setCurrentStepAction = (step: OnboardingStep): OnboardingActionTypes => {
  return {
    type: SET_STEP,
    payload: {
      step
    }
  };
};
