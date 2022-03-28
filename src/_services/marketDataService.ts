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

export const getMarketDataForSymbol = (
  marketDataResults: MarketDataResult[],
  symbol: string
): MarketDataResult | undefined => {
  return marketDataResults?.find(
    (m) => m.symbol === (symbol.startsWith('W') ? symbol.substring(1) : symbol).toLocaleLowerCase()
  );
};
export function getMarketData(
  currency: FiatCurrencyName = FiatCurrencyName.USD
): Promise<MarketDataResult[]> {
  const params: CoinGeckoParams = {
    vs_currency: currency.toLocaleLowerCase(),
    // TODOuse contract acddresses https://api.coingecko.com/api/v3/simple/token_price/polygon-pos?contract_addresses=0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE&vs_currencies=usd
    // ids: tokenIds.join(',').toLocaleLowerCase(),
    ids: [
      'bitcoin',
      'ethereum',
      'matic-network',
      'usd-coin',
      'dai',
      'wrapped-bitcoin',
      'jarvis-synthetic-euro',
      'renbtc',
      'balancer',
      'true-usd',
      'tether',
      'qi-dao',
      'mimatic'
    ]
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
