import {
  OnboardingActionTypes,
  SET_IS_COMPLETE,
  SET_IS_ONGOING,
  SET_STEP
} from '_redux/types/onboardingTypes';

export const setCurrentStepAction = (step: number): OnboardingActionTypes => {
  return {
    type: SET_STEP,
    payload: {
      step
    }
  };
};

export const setOnboardingCompleteAction = (complete: boolean): OnboardingActionTypes => {
  return {
    type: SET_IS_COMPLETE,
    payload: {
      complete
    }
  };
};

export const setOnboardingOngoingAction = (ongoing: boolean): OnboardingActionTypes => {
  return {
    type: SET_IS_ONGOING,
    payload: {
      ongoing
    }
  };
};
