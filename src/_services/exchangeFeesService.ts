import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://api.anyblock.tools',
  headers: {
    Authorization: 'Bearer ' + process.env.REACT_ANYBLOCK_API_KEY,
    Accept: 'application/json'
  }
});

export interface Eip1559Stats {
  maxFee: number;
  priorityFee: number;
  probability: string;
}

export interface Eip1559 {
  slow: Eip1559Stats;
  standard: Eip1559Stats;
  fast: Eip1559Stats;
  fastest: Eip1559Stats;
  instant: Eip1559Stats;
}

export interface GasPrice {
  blockNumber: number;
  blockTime: number;
  eip1559: Eip1559;
  fast: number;
  health: boolean;
  instant: number;
  latestBlockBaseFee: number;
  latestBlockMinFee: number;
  slow: number;
  standard: number;
}

export function getGasPrice(): Promise<GasPrice> {
  return instance.get('/ethereum/ethereum/mainnet/gasprice').then((response) => {
    return response.data as GasPrice;
  });
}

export function getBtcMiningFeerate(): Promise<number> {
  return instance.get('/bitcoin/bitcoin/mainnet/miningfeerate').then((response) => {
    return response.data as number;
  });
}
