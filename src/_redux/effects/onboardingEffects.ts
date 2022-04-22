import { OnboardingActionTypes } from '_redux/types/onboardingTypes';
import { Dispatch } from 'redux';
import {
  setCurrentStepAction,
  setOnboardingCompleteAction,
  setOnboardingOngoingAction,
  setWaitingToAdvanceAction
} from '_redux/actions/onboardingActions';

export const setStep = (step: number) => {
  return function (dispatch: Dispatch<OnboardingActionTypes>) {
    dispatch(setCurrentStepAction(step));
  };
};

export const setWaitingToAdvance = (waiting: boolean) => {
  return function (dispatch: Dispatch<OnboardingActionTypes>) {
    dispatch(setWaitingToAdvanceAction(waiting));
  };
};
export const setOnboardingComplete = (complete: boolean) => {
  return function (dispatch: Dispatch<OnboardingActionTypes>) {
    dispatch(setOnboardingCompleteAction(complete));
  };
};

export const setOnboardingOngoing = (ongoing: boolean) => {
  return function (dispatch: Dispatch<OnboardingActionTypes>) {
    dispatch(setOnboardingOngoingAction(ongoing));
  };
};
