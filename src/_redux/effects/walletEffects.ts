import { Dispatch } from 'redux';
import { ethers } from 'ethers';
import { getErc20TokenBalance } from '_services/walletService';
import {
  getBalanceForTokenAction,
  setAddressAction,
  toggleBalanceIsStaleAction
} from '_redux/actions/walletActions';
import { WalletActionTypes, WalletTokenBalances } from '_redux/types/walletTypes';
import { TokenDefinition } from '_enums/tokens';
import { CryptoCurrencySymbol } from '_enums/currency';
import { CacheRecord } from '_interfaces/cache';

const cacheExpirationInMs = 10000;
const walletCache = new Map<CryptoCurrencySymbol, CacheRecord>();

export const setAddress = (address: string) => {
  return (dispatch: Dispatch<WalletActionTypes>) => {
    dispatch(setAddressAction(address));
  };
};

export const toggleBalanceIsStale = (tokenSymbol: CryptoCurrencySymbol, isStale: boolean) => {
  return (dispatch: Dispatch<WalletActionTypes>) => {
    dispatch(toggleBalanceIsStaleAction(tokenSymbol, isStale));
  };
};

export const getBalanceForToken = (
  token: TokenDefinition,
  provider: ethers.providers.Web3Provider,
  userAddress: string,
  forceRefresh = false
) => {
  return async function (dispatch: Dispatch<WalletActionTypes>) {
    const now = Date.now();
    if (
      !forceRefresh &&
      walletCache.has(token.symbol) &&
      walletCache.get(token.symbol)!.expiration > now
    ) {
      const record = walletCache.get(token.symbol);
      const balanceObj: WalletTokenBalances = {};
      // @ts-ignore
      balanceObj[token.symbol] = record.value;
      dispatch(getBalanceForTokenAction(balanceObj));
    } else {
      const balance = await getErc20TokenBalance(token, provider, userAddress);
      const balanceObj: WalletTokenBalances = {};
      balanceObj[token.symbol] = {
        balance,
        isStale: false
      };
      const record: CacheRecord = {
        value: balance,
        expiration: now + cacheExpirationInMs
      };
      walletCache.set(token.symbol, record);
      dispatch(toggleBalanceIsStaleAction(token.symbol, false));
      dispatch(getBalanceForTokenAction(balanceObj));
    }
  };
};
