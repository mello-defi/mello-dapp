import {
  SET_TOKEN_BALANCES,
  SET_ADDRESS,
  TOGGLE_BALANCES_ARE_STALE,
  WalletActionTypes,
  WalletTokenBalances
} from '_redux/types/walletTypes';
import { CryptoCurrencySymbol } from '_enums/currency';

export const setTokenBalancesAction = (balances: WalletTokenBalances): WalletActionTypes => {
  return {
    type: SET_TOKEN_BALANCES,
    payload: {
      balances
    }
  };
};

export const toggleBalancesAreStaleAction = (balancesAreStale: boolean): WalletActionTypes => {
  return {
    type: TOGGLE_BALANCES_ARE_STALE,
    payload: {
      balancesAreStale
    }
  };
};

export const setAddressAction = (address: string): WalletActionTypes => {
  return {
    type: SET_ADDRESS,
    payload: {
      address
    }
  };
};
