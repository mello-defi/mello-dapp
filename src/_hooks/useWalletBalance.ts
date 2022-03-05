import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { useEffect, useState } from 'react';
import { getBalanceForToken } from '_redux/effects/walletEffects';
import { TokenDefinition } from '_enums/tokens';
import { BigNumber } from 'ethers';
import { CryptoCurrencySymbol } from '_enums/currency';

// let isFetching = false;
type FetchingStuff = {
  [key in CryptoCurrencySymbol]?: boolean;
};
const fetching: FetchingStuff = {};
const useWalletBalance = (token?: TokenDefinition) => {
  const dispatch = useDispatch();
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const provider = useSelector((state: AppState) => state.web3.provider);
  const walletBalances = useSelector((state: AppState) => state.wallet.balances);
  const [userBalance, setUserBalance] = useState<BigNumber>();

  useEffect(() => {
    if (token && provider && userAddress) {
      if (
        walletBalances[token.symbol]?.isStale ||
        (!walletBalances[token.symbol] && (!(token.symbol in fetching) || !fetching[token.symbol]))
      ) {
        fetching[token.symbol] = true;
        dispatch(
          getBalanceForToken(token, provider, userAddress, walletBalances[token.symbol]?.isStale)
        );
      } else {
        const tokenBalance = walletBalances[token.symbol];
        if (tokenBalance) {
          setUserBalance(tokenBalance.balance);
        }
        fetching[token.symbol] = false;
      }
    }
  }, [walletBalances, token, userAddress]);

  return userBalance;
};

export default useWalletBalance;
