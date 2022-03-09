import { NavTab } from '_redux/types/uiTypes';
import React, { FunctionComponent } from 'react';

export const SET_STEP = 'SET_STEP';
export const SET_IS_COMPLETE = 'SET_IS_COMPLETE';
export const SET_IS_ONGOING = 'SET_IS_ONGOING';

export interface OnboardingStep {
  number: number;
  title: string;
  nextStep: OnboardingStep | null;
  component?: FunctionComponent<any>;
  componentProps?: any;
}

export interface OnboardingState {
  currentStep?: OnboardingStep;
  complete: boolean;
  ongoing: boolean;
  termsAndConditionsAccepted?: boolean;
  steps: OnboardingStep[];
}

interface SetStep {
  type: typeof SET_STEP;
  payload: {
    step: OnboardingStep;
  };
}

interface SetIsComplete {
  type: typeof SET_IS_COMPLETE;
  payload: {
    complete: boolean;
  };
}

interface SetIsOngoing {
  type: typeof SET_IS_ONGOING;
  payload: {
    ongoing: boolean;
  };
}
export type OnboardingActionTypes = SetStep | SetIsComplete | SetIsOngoing;
