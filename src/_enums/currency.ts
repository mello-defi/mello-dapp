export enum CryptoCurrencyName {
  BITCOIN = 'Bitcoin',
  WBITCOIN = 'Wrapped Bitcoin',
  RENBITCOIN = 'renBTC',
  ETHEREUM = 'Ethereum',
  WETHEREUM = 'Wrapped Ethereum',
  MATIC = 'MATIC',
  WMATIC = 'Wrapped MATIC',
  USDC = 'USD Coin',
  DAI = 'DAI',
  AVAX = 'Avalanche',
  WAVAX = 'Wrapped AVAX',
  USDCE = 'USD Coin',
  DAIE = 'DAI',
  BAL = 'Balancer',
  JEUR = 'Jarvis Synthetic Euro',
  WBTCE = 'Wrapped BTC'
}

export enum CryptoCurrencySymbol {
  BTC = 'BTC',
  WBTC = 'wBTC',
  RENBTC = 'renBTC',
  ETH = 'ETH',
  WETH = 'WETH',
  BAL = 'BAL',
  MATIC = 'MATIC',
  WMATIC = 'WMATIC',
  USDC = 'USDC',
  DAI = 'DAI',
  JEUR = 'jEUR',
  DAIE = 'DAI.e',
  AVAX = 'AVAX',
  WAVAX = 'WAVAX',
  USDCE = 'USDC.e',
  WBTCE = 'WBTC.e'
}

export enum FiatCurrencyName {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

export interface CurrencyDefinition {
  name: FiatCurrencyName;
  symbol: string;
}

export interface Currencies {
  eur: CurrencyDefinition;
  usd: CurrencyDefinition;
  gbp: CurrencyDefinition;
}

export const currencies: Currencies = {
  eur: {
    name: FiatCurrencyName.EUR,
    symbol: '€'
  },
  usd: {
    name: FiatCurrencyName.USD,
    symbol: '$'
  },
  gbp: {
    name: FiatCurrencyName.GBP,
    symbol: '£'
  }
};
