import { Dispatch } from 'redux';
import { ethers } from 'ethers';
import { Web3ActionTypes } from '_redux/types/web3Types';
import { setNetworkAction, setProviderAction } from '_redux/actions/web3Actions';
import { EvmNetworkDefinition } from '_enums/networks';

export const setProvider = (provider: ethers.providers.Web3Provider) => {
  return async function (dispatch: Dispatch<Web3ActionTypes>) {
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    dispatch(setProviderAction(provider, address));
  };
};

export const setNetwork = (network: EvmNetworkDefinition) => {
  return function (dispatch: Dispatch<Web3ActionTypes>) {
    localStorage.setItem('preferredChainId', network.chainId.toString());
    window.location.reload();
    dispatch(setNetworkAction(network));
  };
};

// export const getWalletBalance = (balance: number) => {
//   return function (dispatch: Dispatch<Web3ActionTypes>) {
//     dispatch(getWalletBalanceAction(balance));
//   };
// };
