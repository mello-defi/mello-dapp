import {
  TOGGLE_BALANCE_IS_STALE,
  GET_BALANCE_FOR_TOKEN,
  SET_ADDRESS,
  WalletActionTypes,
  WalletTokenBalances
} from '_redux/types/walletTypes';
import { CryptoCurrencySymbol } from '_enums/currency';

export const getBalanceForTokenAction = (balance: WalletTokenBalances): WalletActionTypes => {
  return {
    type: GET_BALANCE_FOR_TOKEN,
    payload: {
      balance
    }
  };
};

export const toggleBalanceIsStaleAction = (
  tokenSymbol: CryptoCurrencySymbol,
  isStale: boolean
): WalletActionTypes => {
  return {
    type: TOGGLE_BALANCE_IS_STALE,
    payload: {
      isStale,
      tokenSymbol: tokenSymbol
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
//
// export const getBalanceForAllTokensAction = (balances: WalletTokenBalance): WalletActionTypes => {
//   return {
//     type: GET_BALANCE_FOR_ALL_TOKENS,
//     payload: {
//       balances,
//     }
//   };
// };
