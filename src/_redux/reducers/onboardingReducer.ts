import {
  OnboardingActionTypes,
  OnboardingState,
  SET_IS_COMPLETE,
  SET_IS_ONGOING,
  SET_STEP
} from '_redux/types/onboardingTypes';

const initialState: OnboardingState = {
  complete: false,
  ongoing: false,
  currentStep: 1
};

export const getOnboardingReducer = (
  state: OnboardingState = initialState,
  action: OnboardingActionTypes
): OnboardingState => {
  switch (action.type) {
    case SET_STEP:
      return {
        ...state,
        currentStep: action.payload.step
      };
    case SET_IS_COMPLETE:
      return {
        ...state,
        complete: action.payload.complete
      };
    case SET_IS_ONGOING:
      return {
        ...state,
        ongoing: action.payload.ongoing
      };
    default:
      return state;
  }
};
