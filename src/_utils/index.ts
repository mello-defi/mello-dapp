import { EvmTokenDefinition, GenericTokenSet } from '_enums/tokens';

export const shortenBlockchainAddress = (address: string) => {
  return address.substring(0, 6) + '...' + address.substring(address.length - 4, address.length);
};

export const decimalPlacesAreValid = (value: string, decimals: number) => {
  return value.indexOf('.') === -1 ? true : value.split('.')[1].length <= decimals;
};

export const fixDecimalPlaces = (value: string, decimals: number) => {
  if (value.indexOf('.') === -1) {
    return value;
  }

  const [integer, decimal] = value.split('.');

  if (decimal.length > decimals) {
    return `${integer}.${decimal.substring(0, decimals)}`;
  }

  return value;
};

export function getTokenByAddress(tokenSet: GenericTokenSet, address: string): EvmTokenDefinition {
  const token = Object.values(tokenSet).find(
    (token) => token.address.toLowerCase() === address.toLowerCase()
  );
  if (!token) {
    throw new Error(`Token with address ${address} not found`);
  }
  return token;
}
