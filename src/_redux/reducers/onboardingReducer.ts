import {
  OnboardingActionTypes,
  OnboardingState,
  SET_IS_COMPLETE,
  SET_IS_ONGOING,
  SET_STEP,
  SET_WAITING_TO_ADVANCE,
  RESET
} from '_redux/types/onboardingTypes';

const initialState: OnboardingState = {
  complete: false,
  ongoing: false,
  currentStep: 1,
  waitingToAdvance: false,
};

export const getOnboardingReducer = (
  state: OnboardingState = initialState,
  action: OnboardingActionTypes
): OnboardingState => {
  switch (action.type) {
    case SET_STEP:
      return {
        ...state,
        currentStep: action.payload.step,
      };
    case SET_IS_COMPLETE:
      return {
        ...state,
        complete: action.payload.complete,
        ongoing: false
      };
    case SET_WAITING_TO_ADVANCE:
      return {
        ...state,
        waitingToAdvance: action.payload.waitingToAdvance
      };
    case SET_IS_ONGOING:
      return {
        ...state,
        ongoing: action.payload.ongoing
      };
      case RESET:
        return {
          ...initialState
        };
    default:
      return state;
  }
};
