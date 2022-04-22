import { Dispatch } from 'redux';
import { ethers } from 'ethers';
import { Web3ActionTypes } from '_redux/types/web3Types';
import { connectAction, disconnectAction, setNetworkAction } from '_redux/actions/web3Actions';
import { EVMChainIdNumerical, EvmNetworkDefinition, findEvmNetworkById } from '_enums/networks';
import Web3Modal, { IProviderOptions } from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Torus from '@toruslabs/torus-embed';
import { socialsLogo } from '_assets/images';

const polygonRpcUrl = process.env.REACT_APP_POLYGON_RPC_URL;
// TODO move these to env vars, remove hardcoded network values
const providerOptions: IProviderOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      rpc: {
        137: polygonRpcUrl
      }
    }
  },
  torus: {
    display: {
      logo: socialsLogo,
      name: 'Social',
      description: 'Sign in with your social media account'
    },
    package: Torus,
    options: {
      networkParams: {
        host: polygonRpcUrl,
        chainId: EVMChainIdNumerical.POLYGON_MAINNET
      }
    }
  }
};
const web3Modal = new Web3Modal({
  network: 'mainnet', // optional
  cacheProvider: false, // optional
  disableInjectedProvider: false, // optional
  providerOptions // required
});

const getNetworkDefinition = async (
  provider: ethers.providers.Web3Provider
): Promise<EvmNetworkDefinition> => {
  const network = await provider.getNetwork();
  return findEvmNetworkById(network.chainId);
};

const getProvider = async (): Promise<ethers.providers.Web3Provider> => {
  const web3ModalProvider = await web3Modal.connect();
  return new ethers.providers.Web3Provider(web3ModalProvider, 'any');
};
export const autoConnect = () => {
  return async (dispatch: Dispatch<Web3ActionTypes>) => {
    if (web3Modal.cachedProvider) {
      const provider = await getProvider();
      const signer = provider.getSigner();
      dispatch(connectAction(provider, signer));
      const networkDefinition = await getNetworkDefinition(provider);
      dispatch(setNetworkAction(networkDefinition));
    }
  };
};
export const connect = () => {
  return async (dispatch: Dispatch<Web3ActionTypes>) => {
    const provider = await getProvider();
    const signer = provider.getSigner();
    dispatch(connectAction(provider, signer));
    const networkDefinition = await getNetworkDefinition(provider);
    dispatch(setNetworkAction(networkDefinition));
  };
};

export const disconnect = () => {
  return async (dispatch: Dispatch<Web3ActionTypes>) => {
    web3Modal.clearCachedProvider();
    localStorage.removeItem('walletconnect');
    window.location.reload();
    dispatch(disconnectAction());
  };
};

export const setNetwork = (network: EvmNetworkDefinition) => {
  return function (dispatch: Dispatch<Web3ActionTypes>) {
    localStorage.setItem('preferredChainId', network.chainId.toString());
    window.location.reload();
    dispatch(setNetworkAction(network));
  };
};
