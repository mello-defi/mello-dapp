import { Dispatch } from 'redux';
import { ethers } from 'ethers';
import { getErc20TokenBalance } from '_services/walletService';
import { getBalanceForTokenAction } from '_redux/actions/walletActions';
import { WalletActionTypes, WalletTokenBalances } from '_redux/types/walletTypes';
import { TokenDefinition } from '_enums/tokens';
import { CryptoCurrencySymbol } from '_enums/currency';
import { CacheRecord } from '_interfaces/cache';

const cacheExpirationInMs = 10000;
const cache = new Map<CryptoCurrencySymbol, CacheRecord>();

export const getBalanceForToken = (
  token: TokenDefinition,
  provider: ethers.providers.Web3Provider,
  userAddress: string,
  forceRefresh = false
) => {
  return function (dispatch: Dispatch<WalletActionTypes>) {
    const now = Date.now();
    if (!forceRefresh && cache.has(token.symbol) && cache.get(token.symbol)!.expiration > now) {
      console.log('using cache');
      const record = cache.get(token.symbol);
      const balanceObj: WalletTokenBalances = {};
      // @ts-ignore
      balanceObj[token.symbol] = record.value;
      dispatch(getBalanceForTokenAction(balanceObj));
    } else {
      console.log('cache miss');
      getErc20TokenBalance(token, provider, userAddress)
        .then((balance) => {
          console.log('GOT BALANCE', balance);
          const balanceObj: WalletTokenBalances = {};
          balanceObj[token.symbol] = balance;
          const record: CacheRecord = {
            value: balance,
            expiration: now + cacheExpirationInMs
          };
          console.log('Setting cache', token.symbol);
          cache.set(token.symbol, record);
          dispatch(getBalanceForTokenAction(balanceObj));
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };
};
