import { MarketDataResult } from '_services/marketDataService';
import { AnyAction } from 'redux';

export const GET_MARKET_PRICES = 'GET_MARKET_PRICES';
export const TOGGLE_IS_FETCHING_PRICES = 'TOGGLE_IS_FETCHING_PRICES';
export interface MarketState {
  prices: MarketDataResult[];
  isFetchingPrices: boolean;
}

interface GetMarketPriceForTokens extends AnyAction {
  type: typeof GET_MARKET_PRICES;
  payload: {
    prices: MarketDataResult[];
  };
}

interface ToggleIsFetchingPrices extends AnyAction {
  type: typeof TOGGLE_IS_FETCHING_PRICES;
  payload: {
    isFetchingPrices: boolean;
  };
}
export type MarketActionTypes = GetMarketPriceForTokens | ToggleIsFetchingPrices;
