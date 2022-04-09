import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { useEffect } from 'react';
import { getBalancerPoolAprs, getBalancerPools } from '_redux/effects/balancerEffects';
import useMarketPrices from '_hooks/useMarketPrices';

const useBalancerPools = () => {
  const prices = useMarketPrices();
  const aprsSet = useSelector((state: AppState) => state.balancer.poolsAprSet);
  const pools = useSelector((state: AppState) => state.balancer.pools);
  const { provider, signer, tokenSet } = useSelector((state: AppState) => state.web3);
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!pools && provider && signer && userAddress) {
      const addresses = Object.values(tokenSet).map((token) => token.address.toLowerCase());
      dispatch(getBalancerPools(addresses));
    }
  }, [pools, prices, provider, signer, userAddress]);

  useEffect(() => {
    if (pools && pools.length && provider && signer && !aprsSet) {
      dispatch(getBalancerPoolAprs(pools, prices, provider, signer));
    }
  }, [pools, aprsSet, provider, signer, prices, tokenSet]);
  return pools;
};

export default useBalancerPools;
