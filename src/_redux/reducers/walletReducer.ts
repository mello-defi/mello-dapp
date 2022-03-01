import {
  GET_BALANCE_FOR_TOKEN,
  SET_ADDRESS,
  WalletActionTypes,
  WalletState
} from '_redux/types/walletTypes';

const initialState: WalletState = {
  address: '',
  balances: {}
};

export const getWalletReducer = (
  state: WalletState = initialState,
  action: WalletActionTypes
): WalletState => {
  console.log('walletReducer', action);
  console.log(action.type);
  console.log(action.payload);
  switch (action.type) {
    case GET_BALANCE_FOR_TOKEN:
      return {
        ...state,
        balances: {
          ...state.balances,
          ...action.payload.balance
        }
      };
    case SET_ADDRESS:
      return {
        ...state,
        address: action.payload.address
      };
    default:
      return state;
  }
};
