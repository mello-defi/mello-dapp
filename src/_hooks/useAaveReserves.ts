import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { useEffect } from 'react';
import { getAaveReserves } from '_redux/effects/aaveEffects';

const useAaveReserves = () => {
  const reserves = useSelector((state: AppState) => state.aave.reserves);
  const tokenSet = useSelector((state: AppState) => state.web3.tokenSet);
  const dispatch = useDispatch();
  useEffect(() => {
    if (!reserves) {
      dispatch(getAaveReserves(tokenSet));
    }
  }, [reserves]);
  return reserves;
};

export default useAaveReserves;
