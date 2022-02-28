import { Dispatch } from 'redux';
import { CryptoCurrencySymbol, FiatCurrencyName } from '_enums/currency';
import { CacheRecord } from '_interfaces/cache';
import { MarketActionTypes } from '_redux/types/marketTypes';
import { getMarketData, MarketDataResult } from '_services/marketDataService';
import { getMarketPricesAction } from '_redux/actions/marketActions';

const cacheExpirationInMs = 10000;
const cache = new Map<CryptoCurrencySymbol, CacheRecord>();

export const getMarketPrices = (currency: FiatCurrencyName = FiatCurrencyName.USD) => {
  return function (dispatch: Dispatch<MarketActionTypes>) {
    const now = Date.now();

    getMarketData(currency).then((data: MarketDataResult[]) => {
      // const cacheRecord: CacheRecord = {
      //   data,
      //   timestamp: now,
      // };

      // cache.set(currency, cacheRecord);

      // dispatch(get);
      dispatch(getMarketPricesAction(data));
    });
    // if (cache.has(token.symbol) && cache.get(token.symbol)!.expiration > now) {
    //   console.log('using cache');
    //   const record = cache.get(token.symbol);
    //   const balanceObj: WalletTokenBalances = {};
    //   // @ts-ignore
    //   balanceObj[token.symbol] = record.value;
    //   dispatch(getBalanceForTokenAction(balanceObj));
    // } else {
    //   console.log('cache miss');
    //   getErc20TokenBalance(token, provider, userAddress)
    //     .then((balance) => {
    //       console.log('GOT RESULT FROM ERC2o balance', balance);
    //       const balanceObj: WalletTokenBalances = {};
    //       balanceObj[token.symbol] = balance;
    //       const record: CacheRecord = {
    //         value: balance,
    //         expiration: now + cacheExpirationInMs,
    //       };
    //       console.log('SETTING IN CACHE', record);
    //       cache.set(token.symbol, record);
    //       dispatch(getBalanceForTokenAction(balanceObj));
    //     })
    //     .catch((error) => {
    //       console.error(error);
    //     });
    // }
  };
};
