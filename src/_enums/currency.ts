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
  WBTCE = 'Wrapped BTC',
  MAI = 'MAI',
  TUSD = 'TrueUSD',
  QI = 'Qi',
  USDT = 'Tether'
}

export enum CryptoCurrencySymbol {
  BTC = 'BTC',
  WBTC = 'WBTC',
  RENBTC = 'renBTC',
  ETH = 'ETH',
  WETH = 'WETH',
  BAL = 'BAL',
  MATIC = 'MATIC',
  TUSD = 'TUSD',
  USDT = 'USDT',
  MIMATIC = 'miMATIC',
  WMATIC = 'WMATIC',
  USDC = 'USDC',
  QI = 'QI',
  DAI = 'DAI',
  JEUR = 'jEUR',
  DAIE = 'DAI.e',
  AVAX = 'AVAX',
  WAVAX = 'WAVAX',
  USDCE = 'USDC.e',
  WBTCE = 'WBTC.e'
}

export enum FiatCurrencySymbol {
  USD = 'usd',
  EUR = 'eur',
  GBP = 'gbp'
}

export interface CurrencyDefinition {
  name: FiatCurrencySymbol;
  symbol: string;
}

export interface Currencies {
  eur: CurrencyDefinition;
  usd: CurrencyDefinition;
  gbp: CurrencyDefinition;
}

export const currencies: Currencies = {
  eur: {
    name: FiatCurrencySymbol.EUR,
    symbol: '€'
  },
  usd: {
    name: FiatCurrencySymbol.USD,
    symbol: '$'
  },
  gbp: {
    name: FiatCurrencySymbol.GBP,
    symbol: '£'
  }
};
