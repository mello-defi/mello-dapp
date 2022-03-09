import { BigNumber } from 'ethers';

export interface GasPriceResult {
  safeLow: BigNumber
  standard: BigNumber;
  fast: BigNumber;
  fastest: BigNumber;
}
