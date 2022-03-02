import { Dispatch } from 'redux';
import { BigNumber, ethers } from 'ethers';
import { getErc20TokenBalance } from '_services/walletService';
import { getBalanceForTokenAction, setAddressAction } from '_redux/actions/walletActions';
import { WalletActionTypes, WalletTokenBalances } from '_redux/types/walletTypes';
import { TokenDefinition } from '_enums/tokens';
import { CryptoCurrencySymbol } from '_enums/currency';
import { CacheRecord } from '_interfaces/cache';

const cacheExpirationInMs = 10000;
const walletCache = new Map<CryptoCurrencySymbol, CacheRecord>();

export const setAddress = (address: string) => {
  return async (dispatch: Dispatch<WalletActionTypes>) => {
    dispatch(setAddressAction(address));
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
    // console.log('getBalanceForToken', token.symbol);
    if (!forceRefresh && walletCache.has(token.symbol) && walletCache.get(token.symbol)!.expiration > now) {
      // console.log('CACHE HIT', token.symbol);
      const record = walletCache.get(token.symbol);
      const balanceObj: WalletTokenBalances = {};
      // @ts-ignore
      balanceObj[token.symbol] = record.value;
      // console.log('balanceObj', balanceObj);
      dispatch(getBalanceForTokenAction(balanceObj));
    } else {
      // console.log('CACHE MISS', token.symbol);
      const balance = await getErc20TokenBalance(token, provider, userAddress);
      // console.log('GOT WALLET BALANCE', token.symbol, balance.toString());
      const balanceObj: WalletTokenBalances = {};
      balanceObj[token.symbol] = balance;
      const record: CacheRecord = {
        value: balance,
        expiration: now + cacheExpirationInMs
      };
      walletCache.set(token.symbol, record);
      dispatch(getBalanceForTokenAction(balanceObj));
    }
  };
};
