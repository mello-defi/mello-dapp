import axios from 'axios';
import { GasPriceResult } from '_interfaces/gas';
import { ethers } from 'ethers';

export function getGasPrice(gasPriceApiUrl: string | undefined): Promise<GasPriceResult | null> {
  if (!gasPriceApiUrl) {
    return Promise.resolve(null);
  }
  return axios
    .get(gasPriceApiUrl)
    .then((response) => {
      const result: GasPriceResult = {
        fast: ethers.utils.parseUnits(response.data.fast.toString(), 'gwei'),
        safeLow: ethers.utils.parseUnits(response.data.safeLow.toString(), 'gwei'),
        standard: ethers.utils.parseUnits(response.data.standard.toString(), 'gwei'),
        fastest: ethers.utils.parseUnits(response.data.fastest.toString(), 'gwei'),
        blockTime: response.data.blockTime,
      }
      return result;
    })
    .catch((error) => {
      console.error(error);
      return null;
    });
}
