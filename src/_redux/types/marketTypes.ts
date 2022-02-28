import { MarketDataResult } from '_services/marketDataService';

export const GET_MARKET_PRICES = 'GET_BALANCE_FOR_TOKEN';

export interface MarketState {
  prices: MarketDataResult[];
}

interface GetMarketPriceForTokens {
  type: typeof GET_MARKET_PRICES;
  payload: {
    prices: MarketDataResult[];
  };
}

export type MarketActionTypes = GetMarketPriceForTokens;
