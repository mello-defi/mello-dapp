import { NavTab } from '_redux/types/uiTypes';
import { FunctionComponent } from 'react';

export const SET_STEP = 'SET_STEP';

export interface OnboardingStep {
  number: number;
  title: string;
  nextStep: OnboardingStep | null;
  actionTab?: NavTab;
  component?: FunctionComponent;
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
