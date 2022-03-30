import axios from 'axios';
import { GasPriceResult } from '_interfaces/gas';
import { ethers } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';

export function getGasPrice(gasPriceApiUrl: string | undefined): Promise<GasPriceResult | null> {
  if (!gasPriceApiUrl) {
    return Promise.resolve(null);
  }
  return axios
    .get(gasPriceApiUrl)
    .then((response) => {
      const result: GasPriceResult = {
        fast: parseUnits(response.data.fast.toString(), 'gwei'),
        safeLow: parseUnits(response.data.safeLow.toString(), 'gwei'),
        standard: parseUnits(response.data.standard.toString(), 'gwei'),
        fastest: parseUnits(response.data.fastest.toString(), 'gwei'),
        blockTime: response.data.blockTime || response.data.avgWait
      };
      return result;
    })
    .catch((error) => {
      console.error(error);
      return null;
    });
}
