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
  const balancesAreStale = useSelector((state: AppState) => state.wallet.balancesAreStale);
  const provider = useSelector((state: AppState) => state.web3.provider);
  // if (provider) {
  //   provider.on('pending', async (txHash) => {
  //     console.log('HASH', txHash);
  //     // const tx = await provider.getTransaction(txHash)
  //     // if (!tx || !tx.to) return
  //
  //     // if (tx.from === myWallet) {
  //     //   console.log('Found my wallet!')
  //     //   provider.removeAllListeners()
  //     //   completion(tx)
  //     // }
  //
  //   });
  // }

  const walletBalances = useSelector((state: AppState) => state.wallet.balances);
  const [userBalance, setUserBalance] = useState<BigNumber>();

  useEffect(() => {
    if (token && provider && userAddress) {
      if (
        balancesAreStale ||
        (!walletBalances[token.symbol] && (!(token.symbol in fetching) || !fetching[token.symbol]))
      ) {
        fetching[token.symbol] = true;
        dispatch(getBalanceForToken(token, provider, userAddress, balancesAreStale));
      } else {
        const tokenBalance = walletBalances[token.symbol];
        if (tokenBalance) {
          setUserBalance(tokenBalance);
        }
        fetching[token.symbol] = false;
      }
    }
    // // return () => {
    //   // cleanup
    // };
  }, [walletBalances, token, userAddress, balancesAreStale]);

  return userBalance;
};

export default useWalletBalance;
