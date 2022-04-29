import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { useEffect } from 'react';
import { getUserBalancerPools, getUserPoolsAprs, setTotalInvestedAmount } from '_redux/effects/balancerEffects';
import { calculateUserSharesInFiat } from '_services/balancerCalculatorService';
import { BigNumber as AdvancedBigNumber } from '@aave/protocol-js';
import useMarketPrices from '_hooks/useMarketPrices';

const useUserBalancerPools = () => {
  const userPools = useSelector((state: AppState) => state.balancer.userPools);
  const userPoolsAprsSet = useSelector((state: AppState) => state.balancer.userPoolsAprsSet);
  const { provider, signer, tokenSet } = useSelector((state: AppState) => state.web3);
  const totalInvestedAmount = useSelector((state: AppState) => state.balancer.totalInvestedAmount);
  const prices = useMarketPrices();
  const userPoolsStale = useSelector((state: AppState) => state.balancer.userPoolsStale);
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const dispatch = useDispatch();
  useEffect(() => {
    if (userAddress && userPoolsStale) {
      dispatch(getUserBalancerPools(userAddress));
    }
  }, [userAddress, userPoolsStale]);

  useEffect(() => {
    if (userPools && userPools.length && provider && signer && !userPoolsAprsSet) {
      dispatch(getUserPoolsAprs(userPools, prices, provider, signer));
    }
  }, [userPools, userPoolsAprsSet, provider, signer, prices, tokenSet]);

  useEffect(() => {
    if (userPools && userPools.length) {
      const totalInvestedAmount = userPools
        .map((userPool) => calculateUserSharesInFiat(userPool.poolId, userPool))
        .reduce((totalShares, shares) => totalShares.plus(shares), new AdvancedBigNumber(0))
        .toNumber();
      dispatch(setTotalInvestedAmount(totalInvestedAmount));
    }
  }, [userPools]);

  return {
    userPools,
    totalInvestedAmount
  };
};

export default useUserBalancerPools;
