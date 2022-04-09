import { CryptoCurrencyName, CryptoCurrencySymbol, FiatCurrencySymbol } from '_enums/currency';

export interface CryptoCurrency {
  name: CryptoCurrencyName;
  symbol: CryptoCurrencySymbol;
}

export interface FiatCurrency {
  nameShort: FiatCurrencySymbol;
  nameLong: string;
  symbol: string;
}

export const currencies: FiatCurrency[] = [
  {
    nameLong: 'US Dollar',
    nameShort: FiatCurrencySymbol.USD,
    symbol: '$'
  },
  {
    nameShort: FiatCurrencySymbol.EUR,
    nameLong: 'Euro',
    symbol: '€'
  },
  {
    nameLong: 'British Pound',
    nameShort: FiatCurrencySymbol.GBP,
    symbol: '£'
  }
];
