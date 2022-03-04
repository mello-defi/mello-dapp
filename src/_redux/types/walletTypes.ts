import { CryptoCurrencySymbol } from '_enums/currency';
import { BigNumber } from 'ethers';

export const BALANCES_ARE_STALE = 'BALANCES_ARE_STALE';
export const SET_ADDRESS = 'SET_ADDRESS';
export const GET_BALANCE_FOR_TOKEN = 'GET_BALANCE_FOR_TOKEN';
export const GET_BALANCE_FOR_ALL_TOKENS = 'GET_BALANCE_FOR_ALL_TOKENS';

export type WalletTokenBalances = {
  [key in CryptoCurrencySymbol]?: BigNumber;
};

export interface WalletState {
  address?: string;
  balances: WalletTokenBalances;
  balancesAreStale: boolean;
}

interface GetBalanceForTokenAction {
  type: typeof GET_BALANCE_FOR_TOKEN;
  payload: {
    balance: WalletTokenBalances;
  };
}

interface SetAddressAction {
  type: typeof SET_ADDRESS;
  payload: {
    address: string;
  };
}

interface ToggleBalancesAreStaleAction {
  type: typeof BALANCES_ARE_STALE;
  payload: {
    balancesAreStale: boolean;
  };
}

// interface GetBalanceForAllTokensAction {
//   type: typeof GET_BALANCE_FOR_ALL_TOKENS;
//   payload: {
//     balances: WalletTokenBalance;
//   };
// }

export type WalletActionTypes =
  | GetBalanceForTokenAction
  | SetAddressAction
  | ToggleBalancesAreStaleAction;
// | GetBalanceForAllTokensAction;
