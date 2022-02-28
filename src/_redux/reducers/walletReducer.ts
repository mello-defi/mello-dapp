import { GET_BALANCE_FOR_TOKEN, WalletActionTypes, WalletState } from '_redux/types/walletTypes';

const initialState: WalletState = {
  userAddress: undefined,
  balances: {}
};

export const getWalletReducer = (
  state: WalletState = initialState,
  action: WalletActionTypes
): WalletState => {
  switch (action.type) {
    case GET_BALANCE_FOR_TOKEN:
      return {
        ...state,
        balances: {
          ...state.balances,
          ...action.payload.balance
        }
      };
    default:
      return state;
  }
};
