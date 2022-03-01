import { getMarketPrices } from '_redux/effects/marketEffects';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { useEffect, useState } from 'react';

const useMarketPrices = () => {
  const marketPrices = useSelector((state: AppState) => state.markets.prices);
  const [fetchingPrices, setFetchingPrices] = useState(false);

  const dispatch = useDispatch();
  useEffect(() => {
    if ((!marketPrices || marketPrices.length === 0) && !fetchingPrices) {
      setFetchingPrices(true);
      dispatch(getMarketPrices());
    }
  }, [marketPrices]);
  return marketPrices;
};

export default useMarketPrices;
