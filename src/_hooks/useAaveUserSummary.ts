import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { useEffect } from 'react';
import { getUserSummary } from '_redux/effects/aaveEffects';

const useAaveUserSummary = () => {
  const rawReserves = useSelector((state: AppState) => state.aave.rawReserves);
  const userSummary = useSelector((state: AppState) => state.aave.userSummary);
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const dispatch = useDispatch();
  useEffect(() => {
    if (rawReserves && userAddress && !userSummary) {
      dispatch(getUserSummary(userAddress, rawReserves));
    }
  }, [rawReserves, userSummary]);
  return userSummary;
};

export default useAaveUserSummary;
