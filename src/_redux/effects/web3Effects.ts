import { Dispatch } from 'redux';
import { ethers } from 'ethers';
import { Web3ActionTypes } from '_redux/types/web3Types';
import { connectAction, disconnectAction, setNetworkAction } from '_redux/actions/web3Actions';
import { EvmNetworkDefinition } from '_enums/networks';
import { Magic } from 'magic-sdk';
import { setAddressAction } from '_redux/actions/walletActions';
import { OAuthExtension } from '@magic-ext/oauth';
import Web3Modal, { IAbstractConnectorOptions, IProviderOptions } from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
const polygonMainnet = {
  rpcUrl: 'https://polygon-mainnet.g.alchemy.com/v2/yAbnaHp8ByhAIrQrplXdhhzQRnB5Lu73', // Your own node URL
  chainId: 137, // Your own node's chainId
};

const magic  = new Magic('pk_live_55A8A5721C06A247', {
  extensions: [new OAuthExtension()],
  network: polygonMainnet,
}); // ✨

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

export const connect = () => {
  return async (dispatch: Dispatch<Web3ActionTypes>) => {
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
    // const r = await magic.oauth.getRedirectResult();
    // console.log('RRR');
    // console.log(r);

    // await magic.oauth.loginWithRedirect({
    //   provider: 'github' /* 'google', 'facebook', 'apple', or 'github' */,
    //   redirectURI: 'http://localhost:3000/'
    // });
    //
    // if (await magic.user.isLoggedIn()) {
    //   // const provider = new ethers.providers.Web3Provider(m.rpcProvider);
    //   // @ts-ignore
    //   const provider = new ethers.providers.Web3Provider(m.rpcProvider);
    //   dispatch(connectAction(provider));
    // }
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
