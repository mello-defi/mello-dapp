import { AnyAction } from 'redux';
import { Pool, UserPool } from '_interfaces/balancer';

export const TOGGLE_USER_POOL_DATA_STALE = 'TOGGLE_USER_POOL_DATA_STALE';
export const SET_USER_POOL_DATA = 'SET_USER_POOL_DATA';
export const SET_POOL_DATA = 'GET_POOL_DATA';
export const SET_TOTAL_INVESTED_AMOUNT = 'SET_TOTAL_INVESTED_AMOUNT';

export interface BalancerState {
  userPools?: UserPool[];
  userPoolsAprsSet?: boolean;
  userPoolsStale: boolean;
  pools?: Pool[];
  poolsAprSet: boolean;
  totalInvestedAmount?: number;
}
interface ToggleUserPoolDataStale extends AnyAction {
  type: typeof TOGGLE_USER_POOL_DATA_STALE;
  payload: {
    userPoolsStale: boolean;
  };
}

interface SetUserPoolDataAction extends AnyAction {
  type: typeof SET_USER_POOL_DATA;
  payload: {
    userPools: UserPool[];
    userPoolsAprsSet?: boolean | undefined;
  };
}

interface SetPoolDataAction extends AnyAction {
  type: typeof SET_POOL_DATA;
  payload: {
    pools: Pool[];
    poolsAprsSet?: boolean | undefined;
  };
}

interface SetTotalInvestedAmountAction extends AnyAction {
  type: typeof SET_TOTAL_INVESTED_AMOUNT;
  payload: {
    totalInvestedAmount: number;
  };
}

export type BalancerActionTypes =
  | SetUserPoolDataAction
  | SetPoolDataAction
  | ToggleUserPoolDataStale
  | SetTotalInvestedAmountAction;
