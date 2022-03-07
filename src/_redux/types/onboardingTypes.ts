import { NavTab } from '_redux/types/uiTypes';

export const SET_STEP = 'SET_STEP';

export interface OnboardingStep {
  number: number;
  title: string;
  nextStep: OnboardingStep | null;
  actionTab?: NavTab;
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
