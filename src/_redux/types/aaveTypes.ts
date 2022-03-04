import { ComputedReserveData, ReserveData, UserSummaryData } from '@aave/protocol-js';

export const TOGGLE_USER_SUMMARY_STALE = 'TOGGLE_USER_SUMMARY_STALE';
export const GET_USER_SUMMARY = 'GET_USER_RESERVES';
export const GET_AAVE_RESERVES = 'GET_AAVE_RESERVES';

export interface AaveState {
  userSummary?: UserSummaryData;
  userSummaryStale: boolean;
  reserves?: ComputedReserveData[];
  rawReserves?: ReserveData[];
}
export interface ToggleUserSummaryStaleAction {
  type: typeof TOGGLE_USER_SUMMARY_STALE;
  payload: {
    userSummaryStale: boolean;
  };
}

export interface GetUserSummaryAction {
  type: typeof GET_USER_SUMMARY;
  payload: {
    userSummary: UserSummaryData;
  };
}

export interface GetAaveReservesAction {
  type: typeof GET_AAVE_RESERVES;
  payload: {
    reserves: ComputedReserveData[];
    rawReserves: ReserveData[];
  };
}

export type AaveActionTypes =
  | GetUserSummaryAction
  | GetAaveReservesAction
  | ToggleUserSummaryStaleAction;
