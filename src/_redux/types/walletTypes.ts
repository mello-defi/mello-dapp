import { CryptoCurrencySymbol } from '_enums/currency';

export const GET_BALANCE_FOR_TOKEN = 'GET_BALANCE_FOR_TOKEN';
export const GET_BALANCE_FOR_ALL_TOKENS = 'GET_BALANCE_FOR_ALL_TOKENS';

export type WalletTokenBalances = {
  [key in CryptoCurrencySymbol]?: string;
};

export interface WalletState {
  userAddress: string | undefined;
  balances: WalletTokenBalances;
}

interface GetBalanceForTokenAction {
  type: typeof GET_BALANCE_FOR_TOKEN;
  payload: {
    balance: WalletTokenBalances;
  };
}

// interface GetBalanceForAllTokensAction {
//   type: typeof GET_BALANCE_FOR_ALL_TOKENS;
//   payload: {
//     balances: WalletTokenBalance;
//   };
// }

export type WalletActionTypes = GetBalanceForTokenAction;
// | GetBalanceForAllTokensAction;
