export const SET_STEP = 'SET_STEP';

export interface OnboardingStep {
  number: number;
  title: string;
  previousStep?: OnboardingStep;
  nextStep?: OnboardingStep;
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
