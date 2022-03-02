import { getMarketPrices, toggleIsFetchingPrices } from '_redux/effects/marketEffects';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { Dispatch, SetStateAction, useEffect } from 'react';

// https://stackoverflow.com/questions/57602715/react-custom-hooks-fetch-data-globally-and-share-across-components
let isFetchingPrices = false;

const useMarketPrices = () => {
  const marketPrices = useSelector((state: AppState) => state.markets.prices);
  const dispatch = useDispatch();
  useEffect(() => {
    if ((!marketPrices || marketPrices.length === 0) && !isFetchingPrices) {
      isFetchingPrices = true;
      dispatch(getMarketPrices());
    }
    return () => {
      // console.log("Behavior right before the component is removed from the DOM.");
    }
  }, [marketPrices, isFetchingPrices]);
  return marketPrices;
};

export default useMarketPrices;
