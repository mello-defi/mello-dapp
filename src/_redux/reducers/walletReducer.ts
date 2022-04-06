import {
  SET_ADDRESS,
  SET_TOKEN_BALANCES,
  TOGGLE_BALANCES_ARE_STALE,
  WalletActionTypes,
  WalletState
} from '_redux/types/walletTypes';

const initialState: WalletState = {
  address: undefined,
  balances: {},
  balancesAreStale: true
};

export const getWalletReducer = (
  state: WalletState = initialState,
  action: WalletActionTypes
): WalletState => {
  switch (action.type) {
    case SET_TOKEN_BALANCES:
      return {
        ...state,
        balances: {
          ...action.payload.balances
        },
        balancesAreStale: false
      };
    case SET_ADDRESS:
      return {
        ...state,
        address: action.payload.address.toLowerCase()
      };
    case TOGGLE_BALANCES_ARE_STALE:
      return {
        ...state,
        balancesAreStale: action.payload.balancesAreStale
      };
    default:
      return state;
  }
};
