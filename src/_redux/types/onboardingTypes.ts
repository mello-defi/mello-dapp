import { AnyAction } from 'redux';

export const SET_STEP = 'SET_STEP';
export const SET_WAITING_TO_ADVANCE = 'SET_WAITING_TO_ADVANCE';
export const SET_IS_COMPLETE = 'SET_IS_COMPLETE';
export const SET_IS_ONGOING = 'SET_IS_ONGOING';
export const RESET = 'RESET';

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
  waitingToAdvance: boolean;
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

interface SetWaitingToAdvance extends AnyAction {
  type: typeof SET_WAITING_TO_ADVANCE;
  payload: {
    waitingToAdvance: boolean;
  };
}
interface SetIsOngoing extends AnyAction {
  type: typeof SET_IS_ONGOING;
  payload: {
    ongoing: boolean;
  };
}

interface Reset extends AnyAction {
  type: typeof RESET;
}

export type OnboardingActionTypes =
  | SetStep
  | SetIsComplete
  | SetIsOngoing
  | SetWaitingToAdvance
  | Reset;
