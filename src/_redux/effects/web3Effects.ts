import { Dispatch } from 'redux';
import { ethers } from 'ethers';
import { Web3ActionTypes } from '_redux/types/web3Types';
import { connectAction, disconnectAction, setNetworkAction } from '_redux/actions/web3Actions';
import { EVMChainIdNumerical, EvmNetworkDefinition } from '_enums/networks';
import Web3Modal, { IProviderOptions } from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Torus from '@toruslabs/torus-embed';

const providerOptions: IProviderOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      rpc: {
        137: 'https://polygon-mainnet.g.alchemy.com/v2/yAbnaHp8ByhAIrQrplXdhhzQRnB5Lu73'
      },
      networkId: 'matic'
    }
  },
  torus: {
    display: {
      logo: 'https://www.getopensocial.com/wp-content/uploads/2020/12/social-login-COLOR_2.png',
      name: 'Social',
      description: 'Sign in with your social media account'
    },
    package: Torus, // required
    options: {
      networkParams: {
        host: 'https://polygon-mainnet.g.alchemy.com/v2/yAbnaHp8ByhAIrQrplXdhhzQRnB5Lu73', // optional
        chainId: EVMChainIdNumerical.POLYGON_MAINNET // optional
      }
    }
  }
};
const web3Modal = new Web3Modal({
  network: 'mainnet', // optional
  // cacheProvider: true, // optional
  cacheProvider: false, // optional
  disableInjectedProvider: false, // optional
  providerOptions // required
});
export const connect = () => {
  return async (dispatch: Dispatch<Web3ActionTypes>) => {
    const web3ModalProvider = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(web3ModalProvider, 'any');
    const signer = provider.getSigner();
    dispatch(connectAction(provider, signer));
  };
};

export const disconnect = () => {
  return async (dispatch: Dispatch<Web3ActionTypes>) => {
    web3Modal.clearCachedProvider();
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
