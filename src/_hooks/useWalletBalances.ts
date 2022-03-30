import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { useEffect } from 'react';
import { EvmTokenDefinition } from '_enums/tokens';
import { getAllErc20TokenBalances } from '_services/walletService';
import { setTokenBalances } from '_redux/effects/walletEffects';

// let isFetching = false;
const useWalletBalances = (token?: EvmTokenDefinition) => {
  const dispatch = useDispatch();
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const balancesAreStale = useSelector((state: AppState) => state.wallet.balancesAreStale);
  const { provider, tokenSet } = useSelector((state: AppState) => state.web3);

  const walletBalances = useSelector((state: AppState) => state.wallet.balances);

  useEffect(() => {
    const getAllBalances = async () => {
      if (provider && userAddress && balancesAreStale) {
        const balances = await getAllErc20TokenBalances(provider, tokenSet, userAddress);
        dispatch(setTokenBalances(balances));
      }
    };
    getAllBalances();
  }, [walletBalances, token, userAddress, balancesAreStale]);

  return walletBalances;
};

export default useWalletBalances;
