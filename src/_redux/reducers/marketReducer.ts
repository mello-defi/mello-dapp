import { GET_MARKET_PRICES, MarketActionTypes, MarketState, TOGGLE_IS_FETCHING_PRICES } from '_redux/types/marketTypes';

const initialState: MarketState = {
  prices: {},
  isFetchingPrices: false
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
    case TOGGLE_IS_FETCHING_PRICES:
      return {
        ...state,
        isFetchingPrices: action.payload.isFetchingPrices
      };
    default:
      return state;
  }
};
