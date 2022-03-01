import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { useEffect, useState } from 'react';
import { getBalanceForToken } from '_redux/effects/walletEffects';
import { TokenDefinition } from '_enums/tokens';

const useWalletBalance = (token?: TokenDefinition) => {
  const dispatch = useDispatch();
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const provider = useSelector((state: AppState) => state.web3.provider);
  const walletBalances = useSelector((state: AppState) => state.wallet.balances);
  const [userBalance, setUserBalance] = useState<string>('');

  useEffect(() => {
    if (token && provider) {
      if (!walletBalances[token.symbol]) {
        dispatch(getBalanceForToken(token, provider, userAddress));
      } else {
        const tokenBalance = walletBalances[token.symbol];
        if (tokenBalance) {
          setUserBalance(tokenBalance);
        }
      }
    }
  }, [walletBalances, token]);

  return userBalance;
};

export default useWalletBalance;
