import axios from 'axios';
import { FiatCurrencyName } from '_enums/currency';

const instance = axios.create({
  baseURL: 'https://api.coingecko.com/api/v3/coins/markets',
  headers: {
    Accept: 'application/json'
  }
});

export interface MarketDataResult {
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
}

interface CoinGeckoParams {
  vs_currency: string;
  ids: string;
}

export function getMarketData(
  currency: FiatCurrencyName = FiatCurrencyName.USD
): Promise<MarketDataResult[]> {
  const params: CoinGeckoParams = {
    vs_currency: currency.toLocaleLowerCase(),
    // ids: tokenIds.join(',').toLocaleLowerCase(),
    ids: ['bitcoin', 'ethereum', 'matic-network', 'usd-coin', 'dai', 'wrapped-bitcoin', 'jarvis-synthetic-euro', 'renbtc']
      .join(',')
      .toLocaleLowerCase()
  };
  return instance
    .get(`/`, {
      params
    })
    .then((response) => {
      return response.data as MarketDataResult[];
    });
}
