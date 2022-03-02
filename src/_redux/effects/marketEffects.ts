import { Dispatch } from 'redux';
import { CryptoCurrencySymbol, FiatCurrencyName } from '_enums/currency';
import { CacheRecord } from '_interfaces/cache';
import { MarketActionTypes } from '_redux/types/marketTypes';
import { getMarketData, MarketDataResult } from '_services/marketDataService';
import { getMarketPricesAction, toggleIsFetchingPricesAction } from '_redux/actions/marketActions';

const cacheExpirationInMs = 10000;
const marketCache = new Map<FiatCurrencyName, CacheRecord>();

export const toggleIsFetchingPrices = (isFetching: boolean) => {
  return function (dispatch: Dispatch<MarketActionTypes>) {
    dispatch(toggleIsFetchingPricesAction(isFetching));
  };
};

export const getMarketPrices = (currency: FiatCurrencyName = FiatCurrencyName.USD) => {
  return function (dispatch: Dispatch<MarketActionTypes>) {
    const now = Date.now();
    console.log('getMarketPrices');
    if (marketCache.has(currency) && marketCache.get(currency)!.expiration > now) {
      const record = marketCache.get(currency);
      // @ts-ignore
      dispatch(getMarketPricesAction(record.value));
    } else {
      getMarketData(currency).then((data: MarketDataResult[]) => {
        const record: CacheRecord = {
          value: data,
          expiration: now + cacheExpirationInMs
        };
        marketCache.set(currency, record);
        dispatch(getMarketPricesAction(data));
      });
    }
  };
};
