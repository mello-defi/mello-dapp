import { NavTab } from '_redux/types/uiTypes';
import React, { FunctionComponent } from 'react';

export const SET_STEP = 'SET_STEP';

export interface OnboardingStep {
  number: number;
  title: string;
  nextStep: OnboardingStep | null;
  // component?: React.ReactNode;
  component?: FunctionComponent<any>;
  componentProps?: any;
}

export interface OnboardingState {
  currentStep?: OnboardingStep;
  complete: boolean;
  termsAndConditionsAccepted?: boolean;
  steps: OnboardingStep[];
}

interface SetStep {
  type: typeof SET_STEP;
  payload: {
    step: OnboardingStep;
  };
}
export type OnboardingActionTypes = SetStep;
