import { AaveActionTypes, AaveState, GET_AAVE_RESERVES, GET_USER_SUMMARY } from '_redux/types/aaveTypes';

const initialState: AaveState = {
  userSummary: undefined,
  reserves: undefined,
  rawReserves: undefined
};

export const getAaveReducer = (
  state: AaveState = initialState,
  action: AaveActionTypes
): AaveState => {
  switch (action.type) {
    case GET_AAVE_RESERVES:
      return {
        ...state,
        reserves: action.payload.reserves,
        rawReserves: action.payload.rawReserves
      };
    case GET_USER_SUMMARY:
      return {
        ...state,
        userSummary: action.payload.userSummary,
      };
    default:
      return state;
  }
};
