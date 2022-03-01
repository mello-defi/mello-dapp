import { Dispatch } from 'redux';
import { ethers } from 'ethers';
import { Web3ActionTypes } from '_redux/types/web3Types';
import { connectAction, disconnectAction, setNetworkAction } from '_redux/actions/web3Actions';
import { EVMChainIdHex, EvmNetworkDefinition } from '_enums/networks';
import { Magic } from 'magic-sdk';
import { setAddressAction } from '_redux/actions/walletActions';
import { OAuthExtension } from '@magic-ext/oauth';
import Web3Modal, { IAbstractConnectorOptions, IProviderOptions } from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { Web3Auth } from '@web3auth/web3auth';
import { ADAPTER_EVENTS, CHAIN_NAMESPACES, CONNECTED_EVENT_DATA } from '@web3auth/base';
import { useEffect } from 'react';
import { webcrypto } from 'crypto';
const polygonMainnet = {
  rpcUrl: 'https://polygon-mainnet.g.alchemy.com/v2/yAbnaHp8ByhAIrQrplXdhhzQRnB5Lu73', // Your own node URL
  chainId: 137, // Your own node's chainId
};


// interface IMagicLinkOptions extends IAbstractConnectorOptions {
//   apiKey: string;
// }

// const ConnectToMagicLink = async (
//   FireboxProvider: any,
//   opts: IMagicLinkOptions
// ) => {
//   const provider = new FireboxProvider(opts.apiKey);
//
//   await provider.enable();
//
//   return provider;
// };

const connectWithWeb3Auth = async (dispatch: Dispatch<Web3ActionTypes>) => {
  if (!process.env.REACT_APP_WEB3_AUTH_CLIENT_ID) {
    throw new Error('WEB3_AUTH_CLIENT_ID is not defined');
  }

  const subscribeAuthEvents = (web3auth: Web3Auth) => {
    web3auth.on(ADAPTER_EVENTS.CONNECTED, (data: CONNECTED_EVENT_DATA) => {
      console.log('Yeah!, you are successfully logged in', data);
      // const signer = web3Provider?.getSigner();
      // console.log(signer);
    });

    web3auth.on(ADAPTER_EVENTS.CONNECTING, () => {
      console.log('connecting');
    });

    web3auth.on(ADAPTER_EVENTS.DISCONNECTED, () => {
      console.log('disconnected');
    });

    web3auth.on(ADAPTER_EVENTS.ERRORED, (error) => {
      console.log('someerror or user have cancelled login request', error);
    });
  };
  const web3auth = new Web3Auth({
    chainConfig: {
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      chainId: EVMChainIdHex.POLYGON_MAINNET,
      rpcTarget: 'https://polygon-mainnet.g.alchemy.com/v2/yAbnaHp8ByhAIrQrplXdhhzQRnB5Lu73'
    },
    clientId: process.env.REACT_APP_WEB3_AUTH_CLIENT_ID,
    authMode: 'DAPP'
  });
  web3auth.clearCache();
  await web3auth.initModal();
  await web3auth.connect();

  const initializeModal = () => {
    subscribeAuthEvents(web3auth);
  };

  if (window && document && web3auth) {
    // @ts-ignore
    initializeModal();
  }
  if (web3auth.provider) {
    const provider = new ethers.providers.Web3Provider(web3auth.provider);
    dispatch(connectAction(provider));
  }
}

const connectWithWeb3Modal = async (dispatch: Dispatch<Web3ActionTypes>) => {
  const providerOptions: IProviderOptions = {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: '153d6213fae8445cbe45e6fbfc5e15e0'
      }
    },
  };

  const web3Modal = new Web3Modal({
    network: "mainnet", // optional
    cacheProvider: true, // optional
    providerOptions // required
  });

  const provider = await web3Modal.connect();
  dispatch(connectAction(provider));
}

export const connect = (provider: ethers.providers.Web3Provider) => {
  return async (dispatch: Dispatch<Web3ActionTypes>) => {
    // const r = await magic.oauth.getRedirectResult();
    // console.log('RESULT', r);
    dispatch(connectAction(provider));
  };
}

export const disconnect = () => {
  return async (dispatch: Dispatch) => {
    // await magic.user.logout();
    dispatch(disconnectAction())
  };
}

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
