import { Dispatch } from 'redux';
import { FiatCurrencyName } from '_enums/currency';
import { CacheRecord } from '_interfaces/cache';
import { MarketActionTypes } from '_redux/types/marketTypes';
import { getMarketData } from '_services/marketDataService';
import { getMarketPricesAction, toggleIsFetchingPricesAction } from '_redux/actions/marketActions';
import { AaveActionTypes } from '_redux/types/aaveTypes';
import { getReserves, getUserSummaryData } from '_services/aaveService';
import { ReserveData, UserSummaryData, v2 } from '@aave/protocol-js';
import { getAaveReservesAction, getUserSummaryAction } from '_redux/actions/aaveActions';
import { GenericTokenSet } from '_enums/tokens';

const cacheExpirationInMs = 10000;
// const marketCache = new Map<FiatCurrencyName, CacheRecord>();
// let isMarketDataFetching = false;

export const getUserSummary = (userAddress: string, reserves: ReserveData[]) => {
  return async function (dispatch: Dispatch<AaveActionTypes>) {
    const userSummary = await getUserSummaryData(userAddress, reserves);
    dispatch(getUserSummaryAction(userSummary));

    // const now = Date.now();
    //   if (
    //     marketCache.has(currency) &&
    //     (marketCache.get(currency)!.expiration > now || isMarketDataFetching)
    //   ) {
    //     const record = marketCache.get(currency);
    //     // @ts-ignore
    //     dispatch(getMarketPricesAction(record.value));
    //   } else {
    //     isMarketDataFetching = true;
    //     const data = await getMarketData(currency);
    //     isMarketDataFetching = false;
    //     const record: CacheRecord = {
    //       value: data,
    //       expiration: now + cacheExpirationInMs
    //     };
    //     marketCache.set(currency, record);
    //     console.log('DISPATCHIN GT MARKET PRICE ACTION FROM FRESH', data);
    //     dispatch(getMarketPricesAction(data));
    //   }
    // };
  }
};

export const getAaveReserves = (tokenSet: GenericTokenSet) => {
  return async function (dispatch: Dispatch<AaveActionTypes>) {
    const rawReserves: ReserveData[] = await getReserves();
    const tokenNamesUpper = Object.keys(tokenSet).map(token => token.toUpperCase());
    const reserves = v2.formatReserves(
      rawReserves.filter((r: ReserveData) =>
        tokenNamesUpper.includes(r.symbol.toUpperCase())
      )
    );
    dispatch(getAaveReservesAction(reserves, rawReserves));
  }
};
