import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { useEffect } from 'react';
import { getUserBalancerPools } from '_redux/effects/balancerEffects';

const useUserBalancerPools = () => {
  const userPools = useSelector((state: AppState) => state.balancer.userPools);
  const userPoolsStale = useSelector((state: AppState) => state.balancer.userPoolsStale);
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const dispatch = useDispatch();
  useEffect(() => {
    if (userAddress && userPoolsStale) {
      dispatch(getUserBalancerPools(userAddress));
    }
  }, [userAddress, userPoolsStale]);

  return userPools;
};

export default useUserBalancerPools;
