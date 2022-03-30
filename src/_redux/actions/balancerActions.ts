import {
  BalancerActionTypes,
  SET_POOL_DATA,
  SET_TOTAL_INVESTED_AMOUNT,
  SET_USER_POOL_DATA,
  TOGGLE_USER_POOL_DATA_STALE
} from '_redux/types/balancerTypes';
import { Pool, UserPool } from '_interfaces/balancer';

export const toggleUserPoolDataStaleAction = (userPoolsStale: boolean): BalancerActionTypes => {
  return {
    type: TOGGLE_USER_POOL_DATA_STALE,
    payload: {
      userPoolsStale
    }
  };
};

export const setUserPoolsAction = (
  userPools: UserPool[],
  userPoolsAprsSet?: boolean | undefined
): BalancerActionTypes => {
  return {
    type: SET_USER_POOL_DATA,
    payload: {
      userPools,
      userPoolsAprsSet
    }
  };
};

export const setPoolsAction = (
  pools: Pool[],
  poolsAprsSet?: boolean | undefined
): BalancerActionTypes => {
  return {
    type: SET_POOL_DATA,
    payload: {
      pools,
      poolsAprsSet
    }
  };
};

export const setTotalInvestedAmountAction = (totalInvestedAmount: number): BalancerActionTypes => {
  return {
    type: SET_TOTAL_INVESTED_AMOUNT,
    payload: {
      totalInvestedAmount
    }
  };
};
