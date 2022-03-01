import axios from 'axios';
import { GasPriceResult } from '_interfaces/gas';

export function getGasPrice(gasPriceApiUrl: string | undefined): Promise<GasPriceResult | null> {
  if (!gasPriceApiUrl) {
    return Promise.resolve(null);
  }
  return axios
    .get(gasPriceApiUrl)
    .then((response) => {
      return response.data as GasPriceResult;
    })
    .catch((error) => {
      console.error(error);
      return null;
    });
}
