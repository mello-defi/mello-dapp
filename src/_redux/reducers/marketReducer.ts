import { GET_MARKET_PRICES, MarketActionTypes, MarketState } from '_redux/types/marketTypes';

const initialState: MarketState = {
  prices: []
};

export const getMarketReducer = (
  state: MarketState = initialState,
  action: MarketActionTypes
): MarketState => {
  switch (action.type) {
    case GET_MARKET_PRICES:
      return {
        ...state,
        prices: action.payload.prices
      };
    default:
      return state;
  }
};
