import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { useEffect } from 'react';
import { getUserSummary } from '_redux/effects/aaveEffects';

const useAaveUserSummary = () => {
  const rawReserves = useSelector((state: AppState) => state.aave.rawReserves);
  const userSummary = useSelector((state: AppState) => state.aave.userSummary);
  const userSummaryStale = useSelector((state: AppState) => state.aave.userSummaryStale);
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const dispatch = useDispatch();
  useEffect(() => {
    console.log('useAaveUserSummary useeffect', userSummaryStale);
    if (rawReserves && userAddress && (userSummaryStale || !userSummary)) {
      dispatch(getUserSummary(userAddress, rawReserves));
    }
  }, [rawReserves, userSummary, userSummaryStale]);
  return userSummary;
};

export default useAaveUserSummary;
