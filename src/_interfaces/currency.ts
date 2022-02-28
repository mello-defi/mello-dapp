import { CryptoCurrencyName, CryptoCurrencySymbol, FiatCurrencyName } from '_enums/currency';

export interface CryptoCurrency {
  name: CryptoCurrencyName;
  symbol: CryptoCurrencySymbol;
}

export interface FiatCurrency {
  nameShort: FiatCurrencyName;
  nameLong: string;
  symbol: string;
}

export const currencies: FiatCurrency[] = [
  {
    nameLong: 'US Dollar',
    nameShort: FiatCurrencyName.USD,
    symbol: '$'
  },
  {
    nameShort: FiatCurrencyName.EUR,
    nameLong: 'Euro',
    symbol: '€'
  },
  {
    nameLong: 'British Pound',
    nameShort: FiatCurrencyName.GBP,
    symbol: '£'
  }
];
