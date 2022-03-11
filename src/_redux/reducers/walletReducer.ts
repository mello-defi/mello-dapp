import {
  GET_BALANCE_FOR_TOKEN,
  SET_ADDRESS,
  TOGGLE_BALANCE_IS_STALE,
  WalletActionTypes,
  WalletState
} from '_redux/types/walletTypes';

const initialState: WalletState = {
  address: undefined,
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
    case SET_ADDRESS:
      return {
        ...state,
        address: action.payload.address
      };
    case TOGGLE_BALANCE_IS_STALE:
      if (state.balances[action.payload.tokenSymbol]) {
        return {
          ...state,
          balances: {
            ...state.balances,
            [action.payload.tokenSymbol]: {
              ...state.balances[action.payload.tokenSymbol],
              isStale: action.payload.isStale
            }
          }
        };
      }
      return {
        ...state
      };
    default:
      return state;
  }
};
