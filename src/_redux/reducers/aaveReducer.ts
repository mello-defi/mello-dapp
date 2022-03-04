import {
  AaveActionTypes,
  AaveState,
  GET_AAVE_RESERVES,
  GET_USER_SUMMARY,
  TOGGLE_USER_SUMMARY_STALE
} from '_redux/types/aaveTypes';

const initialState: AaveState = {
  userSummary: undefined,
  userSummaryStale: false,
  reserves: undefined,
  rawReserves: undefined
};

export const getAaveReducer = (
  state: AaveState = initialState,
  action: AaveActionTypes
): AaveState => {
  switch (action.type) {
    case TOGGLE_USER_SUMMARY_STALE:
      return {
        ...state,
        userSummaryStale: action.payload.userSummaryStale
      };
    case GET_AAVE_RESERVES:
      return {
        ...state,
        reserves: action.payload.reserves,
        rawReserves: action.payload.rawReserves
      };
    case GET_USER_SUMMARY:
      return {
        ...state,
        userSummary: action.payload.userSummary
      };
    default:
      return state;
  }
};
