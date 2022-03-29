import { AnyAction } from 'redux';
import { Pool, UserPool } from '_interfaces/balancer';

export const TOGGLE_USER_POOL_DATA_STALE = 'TOGGLE_USER_POOL_DATA_STALE';
export const TOGGLE_APRS_SET = 'TOGGLE_APRS_SET';
export const GET_USER_POOL_DATA = 'GET_USER_POOL_DATA';
export const SET_POOL_DATA = 'GET_POOL_DATA';
export const SET_TOTAL_INVESTED_AMOUNT = 'SET_TOTAL_INVESTED_AMOUNT';

export interface BalancerState {
  userPools?: UserPool[];
  userPoolsStale: boolean;
  pools?: Pool[];
  aprsSet: boolean;
  totalInvestedAmount?: number
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

interface SetPoolDataAction extends AnyAction {
  type: typeof SET_POOL_DATA;
  payload: {
    pools: Pool[];
    aprsSet?: boolean | undefined;
  };
}

interface SetTotalInvestedAmountAction extends AnyAction {
  type: typeof SET_TOTAL_INVESTED_AMOUNT;
  payload: {
    totalInvestedAmount: number;
  };
}

export type BalancerActionTypes =
  | GetUserPoolDataAction
  | SetPoolDataAction
  | ToggleUserPoolDataStale
  | ToggleAprsSet
  | SetTotalInvestedAmountAction;
