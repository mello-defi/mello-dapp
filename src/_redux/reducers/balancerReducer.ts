import {
  BalancerActionTypes,
  BalancerState,
  GET_USER_POOL_DATA,
  SET_POOL_DATA,
  SET_TOTAL_INVESTED_AMOUNT,
  TOGGLE_USER_POOL_DATA_STALE
} from '_redux/types/balancerTypes';

const initialState: BalancerState = {
  pools: [],
  userPools: [],
  userPoolsStale: true,
  aprsSet: false,
  totalInvestedAmount: undefined
};

export const getBalancerReducer = (
  state: BalancerState = initialState,
  action: BalancerActionTypes
): BalancerState => {
  switch (action.type) {
    case TOGGLE_USER_POOL_DATA_STALE:
      return {
        ...state,
        userPoolsStale: action.payload.userPoolsStale
      };
    case SET_TOTAL_INVESTED_AMOUNT:
      return {
        ...state,
        totalInvestedAmount: action.payload.totalInvestedAmount
      };
    case GET_USER_POOL_DATA:
      return {
        ...state,
        userPools: action.payload.userPools,
        userPoolsStale: false
      };
    case SET_POOL_DATA:
      return {
        ...state,
        pools: action.payload.pools,
        aprsSet: !!action.payload.aprsSet
      };
    default:
      return state;
  }
};
