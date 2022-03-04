import { ComputedReserveData, ReserveData, UserSummaryData } from '@aave/protocol-js';

export const GET_USER_SUMMARY = 'GET_USER_RESERVES';
export const GET_AAVE_RESERVES = 'GET_AAVE_RESERVES';

export interface AaveState {
  userSummary?: UserSummaryData;
  reserves?: ComputedReserveData[];
  rawReserves?: ReserveData[];
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

export type AaveActionTypes = GetUserSummaryAction | GetAaveReservesAction;
