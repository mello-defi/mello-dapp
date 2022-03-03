export const shortenBlockchainAddress = (address: string) => {
  return address.substring(0, 6) + '...' + address.substring(address.length - 4, address.length);
};

export const decimalPlacesAreValid = (value: string, decimals: number) => {
  return value.indexOf('.') === -1 ? true : value.split('.')[1].length <= decimals;
};
