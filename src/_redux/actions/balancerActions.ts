import {
  BalancerActionTypes,
  SET_POOL_DATA,
  GET_USER_POOL_DATA,
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

export const getUserPoolDataAction = (userPools: UserPool[]): BalancerActionTypes => {
  return {
    type: GET_USER_POOL_DATA,
    payload: {
      userPools
    }
  };
};

export const setPoolsAction = (
  pools: Pool[],
  aprsSet?: boolean | undefined
): BalancerActionTypes => {
  return {
    type: SET_POOL_DATA,
    payload: {
      pools,
      aprsSet
    }
  };
};
