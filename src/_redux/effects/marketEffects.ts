import { Dispatch } from 'redux';
import { MarketActionTypes } from '_redux/types/marketTypes';
import { getMarketDataForNetwork } from '_services/marketDataService';
import { getMarketPricesAction, toggleIsFetchingPricesAction } from '_redux/actions/marketActions';

// const cacheExpirationInMs = 10000;
// const marketCache = new Map<FiatCurrencySymbol, CacheRecord>();
// let isMarketDataFetching = false;
export const toggleIsFetchingPrices = (isFetching: boolean) => {
  return function (dispatch: Dispatch<MarketActionTypes>) {
    dispatch(toggleIsFetchingPricesAction(isFetching));
  };
};

export const getMarketPrices = (tokenAddresses: string[], chainId: number) => {
  return async function (dispatch: Dispatch<MarketActionTypes>) {
    const now = Date.now();
    // if (
    //   marketCache.has(currency) &&
    //   (marketCache.get(currency)!.expiration > now || isMarketDataFetching)
    // ) {
    //   const record = marketCache.get(currency);
    //   // @ts-ignore
    //   dispatch(getMarketPricesAction(record.value));
    // } else {
    //   isMarketDataFetching = true;
    const data = await getMarketDataForNetwork(tokenAddresses, chainId);
    // isMarketDataFetching = false;
    // const record: CacheRecord = {
    //   value: data,
    //   expiration: now + cacheExpirationInMs
    // };
    // marketCache.set(currency, record);
    dispatch(getMarketPricesAction(data));
    // }
  };
};
