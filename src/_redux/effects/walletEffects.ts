import { Dispatch } from 'redux';
import { setAddressAction, setTokenBalancesAction, toggleBalancesAreStaleAction } from '_redux/actions/walletActions';
import { WalletActionTypes, WalletTokenBalances } from '_redux/types/walletTypes';

export const setAddress = (address: string) => {
  return (dispatch: Dispatch<WalletActionTypes>) => {
    dispatch(setAddressAction(address));
  };
};

export const toggleBalancesAreStale = (balancesAreStale: boolean) => {
  return (dispatch: Dispatch<WalletActionTypes>) => {
    dispatch(toggleBalancesAreStaleAction(balancesAreStale));
  };
};

export const setTokenBalances = (tokenBalances: WalletTokenBalances) => {
  return (dispatch: Dispatch<WalletActionTypes>) => {
    dispatch(setTokenBalancesAction(tokenBalances));
  };
};
