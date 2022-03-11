import { Dispatch } from 'redux';
import { AaveActionTypes } from '_redux/types/aaveTypes';
import { getReserves, getUserSummaryData } from '_services/aaveService';
import { ReserveData, v2 } from '@aave/protocol-js';
import {
  getAaveReservesAction,
  getUserSummaryAction,
  toggleUserSummaryStaleAction
} from '_redux/actions/aaveActions';
import { GenericTokenSet } from '_enums/tokens';

export const toggleUserSummaryStale = (userSummaryStale: boolean) => {
  return function (dispatch: Dispatch<AaveActionTypes>) {
    console.log('toggleUserSummaryStale', userSummaryStale);
    dispatch(toggleUserSummaryStaleAction(userSummaryStale));
  };
};

export const getUserSummary = (userAddress: string, reserves: ReserveData[]) => {
  return async function (dispatch: Dispatch<AaveActionTypes>) {
    const userSummary = await getUserSummaryData(userAddress, reserves);
    dispatch(getUserSummaryAction(userSummary));
  };
};

export const getAaveReserves = (tokenSet: GenericTokenSet) => {
  return async function (dispatch: Dispatch<AaveActionTypes>) {
    const rawReserves: ReserveData[] = await getReserves();
    const tokenNamesUpper = Object.keys(tokenSet).map((token) => token.toUpperCase());
    const reserves = v2.formatReserves(
      rawReserves.filter((r: ReserveData) => tokenNamesUpper.includes(r.symbol.toUpperCase()))
    );
    dispatch(getAaveReservesAction(reserves, rawReserves));
  };
};
