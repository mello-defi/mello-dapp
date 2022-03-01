import { Dispatch } from 'redux';
import { CryptoCurrencySymbol, FiatCurrencyName } from '_enums/currency';
import { CacheRecord } from '_interfaces/cache';
import { MarketActionTypes } from '_redux/types/marketTypes';
import { getMarketData, MarketDataResult } from '_services/marketDataService';
import { getMarketPricesAction } from '_redux/actions/marketActions';
import { WalletTokenBalances } from '_redux/types/walletTypes';
import { getBalanceForTokenAction } from '_redux/actions/walletActions';
import { getErc20TokenBalance } from '_services/walletService';

const cacheExpirationInMs = 10000;
const cache = new Map<FiatCurrencyName, CacheRecord>();

export const getMarketPrices = (currency: FiatCurrencyName = FiatCurrencyName.USD) => {
  return function (dispatch: Dispatch<MarketActionTypes>) {
    const now = Date.now();
    if (cache.has(currency) && cache.get(currency)!.expiration > now) {
      console.log('using cache');
      const record = cache.get(currency);
      // @ts-ignore
      dispatch(getMarketPricesAction(record.value));
    } else {
      getMarketData(currency).then((data: MarketDataResult[]) => {
        const record: CacheRecord = {
          value: data,
          expiration: now + cacheExpirationInMs
        };
        cache.set(currency, record);
        dispatch(getMarketPricesAction(data));
      });
    }

  };
};
