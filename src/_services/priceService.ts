import { currencies, CurrencyDefinition } from '_enums/currency';

export function convertCryptoAmounts(
  amount: string | number,
  sourcePrice: number,
  destinationPrice: number,
  currency: CurrencyDefinition = currencies.usd
): number {
  if (typeof amount === 'string') {
    amount = parseFloat(amount);
  }
  return amount * (sourcePrice / destinationPrice);
}

export function formatTokenValueInFiat(
  price: number | string,
  amount: number | string,
  currency: CurrencyDefinition = currencies.usd
): string {
  if (typeof amount === 'string') {
    amount = parseFloat(amount);
  }
  if (typeof price === 'string') {
    price = parseFloat(price);
  }
  let total = amount * price;
  if (isNaN(total)) {
    total = 0;
  }
  return `${currency.symbol}${total.toFixed(2)}`;
}

export function nFormatter(num: number, digits: number) {
  const lookup = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'k' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'B' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'P' },
    { value: 1e18, symbol: 'E' }
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  const item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value;
    });
  return item ? (num / item.value).toFixed(digits).replace(rx, '$1') + item.symbol : '0';
}
