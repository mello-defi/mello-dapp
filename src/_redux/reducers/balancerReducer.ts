import {
  BalancerActionTypes,
  BalancerState,
  SET_POOL_DATA,
  SET_TOTAL_INVESTED_AMOUNT,
  SET_USER_POOL_DATA,
  TOGGLE_USER_POOL_DATA_STALE
} from '_redux/types/balancerTypes';

const initialState: BalancerState = {
  pools: undefined,
  userPools: undefined,
  userPoolsAprsSet: false,
  userPoolsStale: true,
  poolsAprSet: false,
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
    case SET_USER_POOL_DATA:
      return {
        ...state,
        userPools: action.payload.userPools,
        userPoolsStale: false,
        userPoolsAprsSet: action.payload.userPoolsAprsSet,
      };
    case SET_POOL_DATA:
      return {
        ...state,
        pools: action.payload.pools,
        poolsAprSet: !!action.payload.poolsAprsSet
      };
    default:
      return state;
  }
};
