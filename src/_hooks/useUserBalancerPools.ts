import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { useEffect } from 'react';
import { getUserBalancerPools, setTotalInvestedAmount } from '_redux/effects/balancerEffects';
import { calculateUserSharesInFiat } from '_services/balancerService';
import { BigNumber as AdvancedBigNumber } from '@aave/protocol-js';

const useUserBalancerPools = () => {
  const userPools = useSelector((state: AppState) => state.balancer.userPools);
  const totalInvestedAmount = useSelector((state: AppState) => state.balancer.totalInvestedAmount);
  const userPoolsStale = useSelector((state: AppState) => state.balancer.userPoolsStale);
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const dispatch = useDispatch();
  useEffect(() => {
    if (userAddress && userPoolsStale) {
      dispatch(getUserBalancerPools(userAddress));
    }
  }, [userAddress, userPoolsStale]);

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
