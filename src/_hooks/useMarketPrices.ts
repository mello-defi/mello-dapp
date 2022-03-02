import { getMarketPrices, toggleIsFetchingPrices } from '_redux/effects/marketEffects';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { useEffect, useState } from 'react';
import { toggleIsFetchingPricesAction } from '_redux/actions/marketActions';

const useMarketPrices = () => {
  const marketPrices = useSelector((state: AppState) => state.markets.prices);
  const isFetchingPrices = useSelector((state: AppState) => state.markets.isFetchingPrices);
  const dispatch = useDispatch();
  useEffect(() => {
    if ((!marketPrices || marketPrices.length === 0) && !isFetchingPrices) {
      console.log('fetching prices from hook');
      dispatch(toggleIsFetchingPrices(true));
      dispatch(getMarketPrices());
    }
  }, [marketPrices, isFetchingPrices]);
  return marketPrices;
};

export default useMarketPrices;
