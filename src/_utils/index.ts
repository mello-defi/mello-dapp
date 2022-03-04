import { GenericTokenSet, TokenDefinition } from '_enums/tokens';

export const shortenBlockchainAddress = (address: string) => {
  return address.substring(0, 6) + '...' + address.substring(address.length - 4, address.length);
};

export const decimalPlacesAreValid = (value: string, decimals: number) => {
  return value.indexOf('.') === -1 ? true : value.split('.')[1].length <= decimals;
};

export function findTokenByAddress(tokenSet: GenericTokenSet, address: string): TokenDefinition {
  const token = Object.values(tokenSet).find(
    (token) => token.address.toLowerCase() === address.toLowerCase()
  );
  if (!token) {
    throw new Error(`Token with address ${address} not found`);
  }
  return token;
}
