import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { useEffect } from 'react';
import { getBalancerPoolAprs, getBalancerPools } from '_redux/effects/balancerEffects';
import { MarketDataResult } from '_services/marketDataService';

const useBalancerPools = (prices: MarketDataResult[]) => {
  const aprsSet = useSelector((state: AppState) => state.balancer.aprsSet);
  const pools = useSelector((state: AppState) => state.balancer.pools);
  const provider = useSelector((state: AppState) => state.web3.provider);
  const signer = useSelector((state: AppState) => state.web3.signer);
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const tokenSet = useSelector((state: AppState) => state.web3.tokenSet);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!pools && prices.length > 0 && provider && signer && userAddress) {
      const addresses = Object.values(tokenSet).map((token) => token.address.toLowerCase());
      dispatch(getBalancerPools(addresses));
    }
  }, [pools, prices, provider, signer, userAddress]);

  useEffect(() => {
    if (pools && pools.length && provider && signer && !aprsSet) {
      dispatch(getBalancerPoolAprs(pools, tokenSet, prices, provider, signer));
    }
  }, [pools, aprsSet, provider, signer, prices, tokenSet]);
  return pools;
};

export default useBalancerPools;
