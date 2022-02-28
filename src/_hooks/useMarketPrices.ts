import { getMarketPrices } from '_redux/effects/marketEffects';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { useEffect } from 'react';

const useMarketPrices = () => {
  const marketPrices = useSelector((state: AppState) => state.markets.prices);
  const dispatch = useDispatch();
  useEffect(() => {
    if (!marketPrices || marketPrices.length === 0) {
      dispatch(getMarketPrices());
    }
  }, [marketPrices]);
  return marketPrices;
};

export default useMarketPrices;
