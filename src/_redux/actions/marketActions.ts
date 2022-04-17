import {
  GET_MARKET_PRICES,
  MarketActionTypes,
  TOGGLE_IS_FETCHING_PRICES
} from '_redux/types/marketTypes';
import { NetworkMarketData } from '_services/marketDataService';

export const toggleIsFetchingPricesAction = (isFetchingPrices: boolean): MarketActionTypes => {
  return {
    type: TOGGLE_IS_FETCHING_PRICES,
    payload: {
      isFetchingPrices
    }
  };
};

export const getMarketPricesAction = (prices: NetworkMarketData): MarketActionTypes => {
  return {
    type: GET_MARKET_PRICES,
    payload: {
      prices
    }
  };
};
