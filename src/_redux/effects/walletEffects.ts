import { Dispatch } from 'redux';
import { setAddressAction, setTokenBalancesAction, toggleBalancesAreStaleAction } from '_redux/actions/walletActions';
import { WalletActionTypes, WalletTokenBalances } from '_redux/types/walletTypes';
import { CryptoCurrencySymbol } from '_enums/currency';
import { CacheRecord } from '_interfaces/cache';

const cacheExpirationInMs = 10000;
const walletCache = new Map<CryptoCurrencySymbol, CacheRecord>();

export const setAddress = (address: string) => {
  return (dispatch: Dispatch<WalletActionTypes>) => {
    dispatch(setAddressAction(address));
  };
};

export const toggleBalancesAreStale = (balancesAreStale: boolean) => {
  return (dispatch: Dispatch<WalletActionTypes>) => {
    dispatch(toggleBalancesAreStaleAction(balancesAreStale));
  };
};

export const setTokenBalances = (tokenBalances: WalletTokenBalances) => {
  return (dispatch: Dispatch<WalletActionTypes>) => {
    dispatch(setTokenBalancesAction(tokenBalances));
  };
};
// export const getBalanceForToken = (
//   token: EvmTokenDefinition,
//   provider: ethers.providers.Web3Provider,
//   userAddress: string,
//   forceRefresh = false
// ) => {
//   return async function (dispatch: Dispatch<WalletActionTypes>) {
//     const now = Date.now();
//     // if (
//     //   !forceRefresh &&
//     //   walletCache.has(token.symbol) &&
//     //   walletCache.get(token.symbol)!.expiration > now
//     // ) {
//     //   const record = walletCache.get(token.symbol);
//     //   const balanceObj: WalletTokenBalances = {};
//     //   // @ts-ignore
//     //   balanceObj[token.symbol] = record.value;
//     //   dispatch(getBalanceForTokenAction(balanceObj));
//     // } else {
//     //   // const balance = await getErc20TokenBalance(token, provider, userAddress);
//     //   // const balanceObj: WalletTokenBalances = {};
//     //   // balanceObj[token.symbol] = {
//     //   //   balance,
//     //   //   isStale: false
//     //   // };
//     //   // const record: CacheRecord = {
//     //   //   value: balance,
//     //   //   expiration: now + cacheExpirationInMs
//     //   // };
//     //   // walletCache.set(token.symbol, record);
//     //   // dispatch(getBalanceForTokenAction(balanceObj));
//     // }
//   };
// };
