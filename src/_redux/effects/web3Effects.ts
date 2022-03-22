import { Dispatch } from 'redux';
import { ethers } from 'ethers';
import { Web3ActionTypes } from '_redux/types/web3Types';
import { connectAction, disconnectAction, setNetworkAction } from '_redux/actions/web3Actions';
import { EVMChainIdNumerical, EvmNetworkDefinition, findEvmNetworkById } from '_enums/networks';
import Web3Modal, { IProviderOptions } from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Torus from '@toruslabs/torus-embed';
import { socialsLogo } from '_assets/images';

const rpcUrl = process.env.REACT_APP_POLYGON_RPC_URL;
// REVIEW move these to env vars, remove hardcoded network values
const providerOptions: IProviderOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      rpc: {
        137: rpcUrl
      },
      chainId: EVMChainIdNumerical.POLYGON_MAINNET,
      networkId: 'matic',
      rpcUrl: rpcUrl
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
        host: rpcUrl,
        chainId: EVMChainIdNumerical.POLYGON_MAINNET
      }
    }
  }
};
const web3Modal = new Web3Modal({
  network: 'mainnet', // optional
  cacheProvider: true, // optional
  // cacheProvider: false, // optional
  disableInjectedProvider: false, // optional
  providerOptions // required
});
export const connect = () => {
  return async (dispatch: Dispatch<Web3ActionTypes>) => {
    const web3ModalProvider = await web3Modal.connect();
    // web3ModalProvider.on('disconnect', (code: number, reason: string) => {
    //   console.log(code, reason);
    // });

    const provider = new ethers.providers.Web3Provider(web3ModalProvider, 'any');
    const network = await provider.getNetwork();
    const networkDefinition = findEvmNetworkById(network.chainId);
    dispatch(setNetworkAction(networkDefinition));
    const signer = provider.getSigner();
    dispatch(connectAction(provider, signer));
  };
};

export const disconnect = () => {
  return async (dispatch: Dispatch<Web3ActionTypes>) => {
    web3Modal.clearCachedProvider();
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
