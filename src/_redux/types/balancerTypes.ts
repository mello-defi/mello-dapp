import { AnyAction } from 'redux';
import { Pool, UserPool } from '_interfaces/balancer';

export const TOGGLE_USER_POOL_DATA_STALE = 'TOGGLE_USER_POOL_DATA_STALE';
export const TOGGLE_APRS_SET = 'TOGGLE_APRS_SET';
export const GET_USER_POOL_DATA = 'GET_USER_POOL_DATA';
export const SET_POOL_DATA = 'GET_POOL_DATA';

export interface BalancerState {
  userPools?: UserPool[];
  userPoolsStale: boolean;
  pools?: Pool[];
  aprsSet: boolean;
}
interface ToggleUserPoolDataStale extends AnyAction {
  type: typeof TOGGLE_USER_POOL_DATA_STALE;
  payload: {
    userPoolsStale: boolean;
  };
}
interface ToggleAprsSet extends AnyAction {
  type: typeof TOGGLE_APRS_SET;
  payload: {
    aprsSet: boolean;
  };
}

interface GetUserPoolDataAction extends AnyAction {
  type: typeof GET_USER_POOL_DATA;
  payload: {
    userPools: UserPool[];
  };
}

interface GetPoolDataAction extends AnyAction {
  type: typeof SET_POOL_DATA;
  payload: {
    pools: Pool[];
    aprsSet?: boolean | undefined;
  };
}

export type BalancerActionTypes =
  | GetUserPoolDataAction
  | GetPoolDataAction
  | ToggleUserPoolDataStale
  | ToggleAprsSet;
