import { Dispatch } from 'redux';
import { FiatCurrencyName } from '_enums/currency';
import { CacheRecord } from '_interfaces/cache';
import { MarketActionTypes } from '_redux/types/marketTypes';
import { getMarketData } from '_services/marketDataService';
import { getMarketPricesAction, toggleIsFetchingPricesAction } from '_redux/actions/marketActions';

const cacheExpirationInMs = 10000;
const marketCache = new Map<FiatCurrencyName, CacheRecord>();
let isMarketDataFetching = false;
export const toggleIsFetchingPrices = (isFetching: boolean) => {
  return function (dispatch: Dispatch<MarketActionTypes>) {
    dispatch(toggleIsFetchingPricesAction(isFetching));
  };
};

export const getMarketPrices = (currency: FiatCurrencyName = FiatCurrencyName.USD) => {
  return async function (dispatch: Dispatch<MarketActionTypes>) {
    const now = Date.now();
    if (
      marketCache.has(currency) &&
      (marketCache.get(currency)!.expiration > now || isMarketDataFetching)
    ) {
      const record = marketCache.get(currency);
      // @ts-ignore
      dispatch(getMarketPricesAction(record.value));
    } else {
      isMarketDataFetching = true;
      const data = await getMarketData(currency);
      isMarketDataFetching = false;
      const record: CacheRecord = {
        value: data,
        expiration: now + cacheExpirationInMs
      };
      marketCache.set(currency, record);
      console.log('DISPATCHIN GT MARKET PRICE ACTION FROM FRESH', data);
      dispatch(getMarketPricesAction(data));
    }
  };
};
