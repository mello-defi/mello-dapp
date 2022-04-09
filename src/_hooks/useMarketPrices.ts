import { getMarketPrices } from '_redux/effects/marketEffects';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { useEffect, useState } from 'react';

const useMarketPrices = () => {
  const marketPrices = useSelector((state: AppState) => state.markets.prices);
  const [isFetching, setIsFetching] = useState(false);
  const { network, tokenSet } = useSelector((state: AppState) => state.web3);
  const dispatch = useDispatch();
  useEffect(() => {
    if (!isFetching) {
      setIsFetching(true);
      dispatch(getMarketPrices(Object.values(tokenSet).map((token) => token.address), network.chainId));
    }
  }, [marketPrices, isFetching]);
  return marketPrices;
};

export default useMarketPrices;
