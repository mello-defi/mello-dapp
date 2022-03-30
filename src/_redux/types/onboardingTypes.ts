import { AnyAction } from 'redux';

export const SET_STEP = 'SET_STEP';
export const SET_IS_COMPLETE = 'SET_IS_COMPLETE';
export const SET_IS_ONGOING = 'SET_IS_ONGOING';

export interface OnboardingStepDescription {
  text?: string;
  whatIsRequired?: string;
  whyIsRequired?: string;
  notes?: string;
}

export interface OnboardingState {
  currentStep: number;
  complete: boolean;
  ongoing: boolean;
}

interface SetStep extends AnyAction {
  type: typeof SET_STEP;
  payload: {
    step: number;
  };
}

interface SetIsComplete extends AnyAction {
  type: typeof SET_IS_COMPLETE;
  payload: {
    complete: boolean;
  };
}

interface SetIsOngoing extends AnyAction {
  type: typeof SET_IS_ONGOING;
  payload: {
    ongoing: boolean;
  };
}
export type OnboardingActionTypes = SetStep | SetIsComplete | SetIsOngoing;
