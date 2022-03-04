import {
  BALANCES_ARE_STALE,
  GET_BALANCE_FOR_TOKEN,
  SET_ADDRESS,
  WalletActionTypes,
  WalletState
} from '_redux/types/walletTypes';

const initialState: WalletState = {
  address: undefined,
  balances: {},
  balancesAreStale: false,
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
    case SET_ADDRESS:
      return {
        ...state,
        address: action.payload.address
      };
    case BALANCES_ARE_STALE:
      return {
        ...state,
        balancesAreStale: action.payload.balancesAreStale,
      };
    default:
      return state;
  }
};
