import {
  OnboardingActionTypes,
  SET_IS_COMPLETE,
  SET_IS_ONGOING,
  SET_STEP,
  SET_WAITING_TO_ADVANCE
} from '_redux/types/onboardingTypes';

export const setCurrentStepAction = (step: number): OnboardingActionTypes => {
  return {
    type: SET_STEP,
    payload: {
      step
    }
  };
};

export const setWaitingToAdvanceAction = (waitingToAdvance: boolean): OnboardingActionTypes => {
  return {
    type: SET_WAITING_TO_ADVANCE,
    payload: {
      waitingToAdvance,
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
