import axios from 'axios';
import { CryptoCurrencySymbol, FiatCurrencySymbol } from '_enums/currency';
import { EvmTokenDefinition } from '_enums/tokens';
import { EVMChainIdNumerical } from '_enums/networks';

const instance = axios.create({
  baseURL: 'https://api.coingecko.com/api/v3/',
  headers: {
    Accept: 'application/json'
  }
});

export interface NetworkMarketData {
  [address: string]: number;
}

export interface SymbolMarketData {
  [symbol: string]: number;
}

interface MarketDataForNetworkResponse {
  [address: string]: {
    [currency: string]: number;
  }
}
interface MarketDataForNetworkParams {
  vs_currencies: string;
  contract_addresses: string;
}

export interface MarketDataForSymbolResponse {
  symbol: string;
  current_price: number;
}

interface MarketDataForSymbolParams {
  vs_currency: string;
  ids: string;
}

// For getting market data for non-network specific tokens
// e.g. BTC and ETH when bridging
export function getMarketDataForAdditionalSymbols(
  currency: FiatCurrencySymbol = FiatCurrencySymbol.USD
): Promise<SymbolMarketData> {
  const params: MarketDataForSymbolParams = {
    vs_currency: currency.toLocaleLowerCase(),
    ids: ['bitcoin', 'ethereum'].join(',').toLocaleLowerCase()
  };
  return instance
    .get(`/coins/markets`, {
      params
    })
    .then((response) => {
      const rawResponse = response.data as MarketDataForSymbolResponse[];
      return rawResponse.reduce((acc: SymbolMarketData, curr: MarketDataForSymbolResponse) => {
        acc[curr.symbol] = curr.current_price;
        return acc;
      }, {} as SymbolMarketData);
    });
}

export function getMarketDataForNetwork(
  tokenAddresses: string[],
  networkId: number,
  currency: FiatCurrencySymbol = FiatCurrencySymbol.USD
): Promise<NetworkMarketData> {
  let urlSuffix = '';
  // TODO - do this everywhere so we know where new chains will fail
  if (networkId === EVMChainIdNumerical.POLYGON_MAINNET) {
    urlSuffix = 'polygon-pos';
  } else {
    throw new Error(`Unsupported network id: ${networkId}`);
  }
  const currencyParam = currency.toLowerCase();
  const params: MarketDataForNetworkParams = {
    vs_currencies: [currencyParam].join(','),
    contract_addresses: tokenAddresses.join(','),
  };
  return instance
    .get(`/simple/token_price/${urlSuffix}`, {
      params
    })
    .then((response) => {
      const rawData = response.data as MarketDataForNetworkResponse;
      return Object.keys(rawData).reduce((acc, address) => {
        const data = rawData[address];
        acc[address.toLowerCase()] = data[currencyParam];
        return acc;
      }, {} as NetworkMarketData);
    });
}
