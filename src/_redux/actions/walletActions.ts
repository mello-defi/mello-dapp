import { GET_BALANCE_FOR_TOKEN, SET_ADDRESS, WalletActionTypes, WalletTokenBalances } from '_redux/types/walletTypes';

export const getBalanceForTokenAction = (balance: WalletTokenBalances): WalletActionTypes => {
  return {
    type: GET_BALANCE_FOR_TOKEN,
    payload: {
      balance
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
