import { GET_MARKET_PRICES, MarketActionTypes } from '_redux/types/marketTypes';
import { MarketDataResult } from '_services/marketDataService';

export const getMarketPricesAction = (prices: MarketDataResult[]): MarketActionTypes => {
  return {
    type: GET_MARKET_PRICES,
    payload: {
      prices
    }
  };
};
