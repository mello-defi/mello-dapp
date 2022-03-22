import { CryptoCurrencySymbol } from '_enums/currency';
import { BigNumber } from 'ethers';
import { AnyAction } from 'redux';

export const TOGGLE_BALANCE_IS_STALE = 'TOGGLE_BALANCE_IS_STALE';
export const SET_ADDRESS = 'SET_ADDRESS';
export const GET_BALANCE_FOR_TOKEN = 'GET_BALANCE_FOR_TOKEN';
export const GET_BALANCE_FOR_ALL_TOKENS = 'GET_BALANCE_FOR_ALL_TOKENS';

export interface WalletTokenBalance {
  balance: BigNumber;
  isStale: boolean;
}
export type WalletTokenBalances = {
  [key in CryptoCurrencySymbol]?: WalletTokenBalance;
};

export interface WalletState {
  address?: string;
  balances: WalletTokenBalances;
}

interface GetBalanceForTokenAction extends AnyAction {
  type: typeof GET_BALANCE_FOR_TOKEN;
  payload: {
    balance: WalletTokenBalances;
  };
}

interface SetAddressAction extends AnyAction {
  type: typeof SET_ADDRESS;
  payload: {
    address: string;
  };
}

interface ToggleBalanceIsStaleAction extends AnyAction {
  type: typeof TOGGLE_BALANCE_IS_STALE;
  payload: {
    tokenSymbol: CryptoCurrencySymbol;
    isStale: boolean;
  };
}

export type WalletActionTypes =
  | GetBalanceForTokenAction
  | SetAddressAction
  | ToggleBalanceIsStaleAction;
