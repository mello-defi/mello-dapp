import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { useEffect, useState } from 'react';
import { getUserSummary } from '_redux/effects/aaveEffects';
import useAaveReserves from '_hooks/useAaveReserves';
import { GasPriceResult } from '_interfaces/gas';
import { getGasPrice } from '_services/gasService';

const useGasPrices = () => {
  const network = useSelector((state: AppState) => state.web3.network);
  const [gasPrices, setGasPrices] = useState<GasPriceResult | null>(null);
  useEffect(() => {
    // const gas = await getGasPrice(network.gasStationUrl)
  }, []);
  return gasPrices;
};

export default useGasPrices;
