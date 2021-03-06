import {
  AaveActionTypes,
  GET_AAVE_RESERVES,
  GET_USER_SUMMARY,
  TOGGLE_USER_SUMMARY_STALE
} from '_redux/types/aaveTypes';
import { ComputedReserveData, ReserveData, UserSummaryData } from '@aave/protocol-js';

export const toggleUserSummaryStaleAction = (userSummaryStale: boolean): AaveActionTypes => {
  return {
    type: TOGGLE_USER_SUMMARY_STALE,
    payload: {
      userSummaryStale
    }
  };
};

export const getUserSummaryAction = (userReserves: UserSummaryData): AaveActionTypes => {
  return {
    type: GET_USER_SUMMARY,
    payload: {
      userSummary: userReserves
    }
  };
};

export const getAaveReservesAction = (
  reserves: ComputedReserveData[],
  rawReserves: ReserveData[]
): AaveActionTypes => {
  return {
    type: GET_AAVE_RESERVES,
    payload: {
      reserves,
      rawReserves
    }
  };
};
