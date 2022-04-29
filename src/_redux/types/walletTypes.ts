import { CryptoCurrencySymbol, FiatCurrencySymbol } from '_enums/currency';
import { BigNumber } from 'ethers';
import { AnyAction } from 'redux';

export const TOGGLE_BALANCES_ARE_STALE = 'TOGGLE_BALANCES_ARE_STALE';
export const SET_ADDRESS = 'SET_ADDRESS';
export const SET_TOKEN_BALANCES = 'SET_TOKEN_BALANCES';

export interface WalletTokenBalance {
  balance: BigNumber;
}
export type WalletTokenBalances = {
  [key in CryptoCurrencySymbol]?: WalletTokenBalance;
};

export interface WalletState {
  fiatCurrency: FiatCurrencySymbol;
  address?: string;
  balances: WalletTokenBalances;
  balancesAreStale: boolean;
}

interface SetTokenBalancesAction extends AnyAction {
  type: typeof SET_TOKEN_BALANCES;
  payload: {
    balances: WalletTokenBalances;
  };
}

interface SetAddressAction extends AnyAction {
  type: typeof SET_ADDRESS;
  payload: {
    address: string;
  };
}

interface ToggleBalancesAreStaleAction extends AnyAction {
  type: typeof TOGGLE_BALANCES_ARE_STALE;
  payload: {
    balancesAreStale: boolean;
  };
}

export type WalletActionTypes =
  | SetTokenBalancesAction
  | SetAddressAction
  | ToggleBalancesAreStaleAction;
