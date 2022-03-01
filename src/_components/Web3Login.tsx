import React, { useEffect } from 'react';
import { Web3Auth } from '@web3auth/web3auth';
import { ADAPTER_EVENTS, CHAIN_NAMESPACES, CONNECTED_EVENT_DATA } from '@web3auth/base';
import { ethers } from 'ethers';
import { useDispatch, useSelector } from 'react-redux';
import { Button, ButtonSize, ButtonVariant } from './core/Buttons';
import { connect, setNetwork } from '_redux/effects/web3Effects';
import Torus from '@toruslabs/torus-embed';
import { AppState } from '_redux/store';
import { findEvmNetworkById } from '_enums/networks';
import Web3Modal, { IProviderOptions } from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { Magic } from 'magic-sdk';
import Fortmatic from 'fortmatic';
import { setAddressAction } from '_redux/actions/walletActions';

const polygonMainnet = {
  rpcUrl: 'https://polygon-mainnet.g.alchemy.com/v2/yAbnaHp8ByhAIrQrplXdhhzQRnB5Lu73', // Your own node URL
  chainId: 137, // Your own node's chainId
};

const m = new Magic('pk_live_55A8A5721C06A247', {
  network: polygonMainnet,
}); // ✨

const fm = new Fortmatic('pk_live_4241ADEA19D86FC1');

const torus = new Torus();

function App() {
  const dispatch = useDispatch();
  const network = useSelector((state: AppState) => state.web3.network);
  const isConnected = useSelector((state: AppState) => state.web3.isConnected);
  const address = useSelector((state: AppState) => state.wallet.address);
  const provider = useSelector((state: AppState) => state.web3.provider);
  useEffect(() => {
    if (isConnected && provider && !address) {
      const signer = provider.getSigner();
      signer.getAddress().then((address) => {
        dispatch(setAddressAction(address));
      });
    }
  }, [isConnected, network, dispatch]);
  // provider=github&state=tb_3IAKsbs2asKE3fTOotmf2y1kL8GyFMRnY4reg4eOWNYRm7rP0QKTRVkZQCB-fj7Noyx.UzBbvr46GEzZVnf4Mv2C7mCKgkz8vtxFPuCU9Hrj4lCJvIXzTYgEZfphT&scope=read%3Auser%20user%3Aemail&magic_oauth_request_id=J2ERkE-V-g17r-tKoRdeZvCS681Ilt9DOt0c8VffpTM%3D&magic_credential=WyIweDYyZmNlNGUzYzYzYjRjMTY3MDg1MzZjZWNmN2Y2ZWYyMmZhZGY1ZDdjYTkyNDllOTM2MDFhZjRmOTk5MDFlODk1NDYzMjkwNmY1NWNmYzEzYjk3M2FjNGFkOGUxY2I1ODFlYmMyMzViOWFiNTgzZTczOGQ4OGJjZjc2YWJiZDg5MWMiLCJ7XCJpYXRcIjoxNjQ2MTQxNTMzLFwiZXh0XCI6MTY0NjE0MjQzMyxcImlzc1wiOlwiZGlkOmV0aHI6MHg4ODNhOTM0NjE5OTQ2YmZlMjg3ODU3ZWQ2MkYzZEUxODhhYkM2ODM0XCIsXCJzdWJcIjpcImxUZVk3cndOdXM1amxKUFRTeVhfY0dzZUdMNUNsVk03ZVNKaHZ4OWpNUzg9XCIsXCJhdWRcIjpcInNidUFzdlZzX3FWb3NFYl9KU3pjVFplZ2dvWXlDY053cDRSVExlQXcyVWs9XCIsXCJuYmZcIjoxNjQ2MTQxNTMzLFwidGlkXCI6XCIyZDU4ODUwZC03NTA5LTQ1ZDEtOTgwMC02OTMxZmNlZWE2NTVcIixcImFkZFwiOlwiMHhkYWU0ZDE5NDI5NGM0NmQ3Y2RjYmEyNzA3MWQ2YTVhZjUyNzViZjE4NTU0Mzg0MmU2Y2MzMzZmZjdmMzM5MjE3NWQ3YjVlNTM5YWUzMzllNWI0YjYxNzFhYWFhNjNmMmIwY2M3YWY0NzdmNmM4MGFjYzdjMTZlNzA3YWU5NDY3NjFiXCJ9Il0%3D
  // if (!process.env.REACT_APP_WEB3_AUTH_CLIENT_ID) {
  //   throw new Error('WEB3_AUTH_CLIENT_ID is not defined');
  // }
  //
  // const web3auth = new Web3Auth({
  //   chainConfig: {
  //     chainNamespace: CHAIN_NAMESPACES.EIP155,
  //     chainId: network.chainIdHex,
  //     rpcTarget: 'https://polygon-mainnet.g.alchemy.com/v2/yAbnaHp8ByhAIrQrplXdhhzQRnB5Lu73'
  //   },
  //   clientId: process.env.REACT_APP_WEB3_AUTH_CLIENT_ID,
  //   authMode: 'DAPP'
  // });
  //
  // web3auth.clearCache();
  //
  // const subscribeAuthEvents = (web3auth: Web3Auth) => {
  //   web3auth.on(ADAPTER_EVENTS.CONNECTED, (data: CONNECTED_EVENT_DATA) => {
  //     console.log('Yeah!, you are successfully logged in', data);
  //     // const signer = web3Provider?.getSigner();
  //     // console.log(signer);
  //   });
  //
  //   web3auth.on(ADAPTER_EVENTS.CONNECTING, () => {
  //     console.log('connecting');
  //   });
  //
  //   web3auth.on(ADAPTER_EVENTS.DISCONNECTED, () => {
  //     console.log('disconnected');
  //   });
  //
  //   web3auth.on(ADAPTER_EVENTS.ERRORED, (error) => {
  //     console.log('someerror or user have cancelled login request', error);
  //   });
  // };
  //
  // useEffect(() => {
  //   if (window && document) {
  //     // @ts-ignore
  //     initializeModal();
  //   }
  // }, []);
  //
  // const web3modalinit = async () => {
  //   const providerOptions: IProviderOptions = {
  //     walletconnect: {
  //       package: WalletConnectProvider, // required
  //       options: {
  //         infuraId: '153d6213fae8445cbe45e6fbfc5e15e0'
  //       }
  //     }
  //   };
  //
  //   console.log('CALLING MODAL');
  //   const web3Modal = new Web3Modal({
  //     // network: "mainnet", // optional
  //     // disableInjectedProvider: true,
  //     cacheProvider: false, // optional
  //     providerOptions
  //   });
  //
  //   web3Modal.clearCachedProvider();
  //   const instance = await web3Modal.connect();
  //   console.log('INSRANCE', instance);
  //
  //   instance.on('accountsChanged', (accounts: any) => {
  //     console.log('ACCOUNTS CHANGED', accounts);
  //   });
  //
  //   // Subscribe to chainId change
  //   instance.on('chainChanged', (chainId: any) => {
  //     console.log('CHAIN CHANGED', chainId);
  //   });
  //
  //   // Subscribe to networkId change
  //   instance.on('networkChanged', (networkId: string) => {
  //     dispatch(setNetwork(findEvmNetworkById(networkId)));
  //   });
  //   const provider = new ethers.providers.Web3Provider(instance);
  //
  //   // dispatch(setProvider(provider));
  //   // provider.
  // };
  //
  // const torusconnect = async () => {
  //   // const host = network.chainId === EVMChainIdNumerical.POLYGON_MAINNET ? 'matic' : 'mainnet';
  //   // console.log('HOST', host);
  //   // await torus.init({
  //   //   network: {
  //   //     chainId: network.chainId,
  //   //     host
  //   //   }
  //   // });
  //   // console.log('CHAINID', network.chainId);
  //   // console.log('TORUS', torus.provider);
  //   // // await torus.setProvider({
  //   // //   chainId: EVMChainIdNumerical.POLYGON_MAINNET,
  //   // // });
  //   // await torus.login(); // await torus.ethereum.enable()
  //   // console.log('TORUS', torus.provider);
  //   // if (torus.provider) {
  //   //   const provider = new ethers.providers.Web3Provider(torus.provider, network);
  //   //   // torus.showWallet('transfer');
  //   //   dispatch(setProvider(provider));
  //   //   // const accounts = await provider.listAccounts();
  //   //   // console.log('LOGINN')
  //   //   // console.log(accounts[0]);
  //   //   // const signer = provider.getSigner()
  //   //   // console.log('SINGING MESSAGe');
  //   //   // await signer.signMessage('test', accounts[0])
  //   // }
  // };
  // const initializeModal = () => {
  //   subscribeAuthEvents(web3auth);
  // };

  const login = async () => {
    // await web3auth.login();
    // await web3authcconnectt();
    // await web3auth.initModal();
    // await web3auth.connect();
    // if (web3auth.provider) {
    //   const provider = new ethers.providers.Web3Provider(web3auth.provider);
    //   dispatch(setProvider(provider));
    // }
    // await m.authenticate();

    // @ts-ignore
    // dispatch(setProvider(fm.getProvider()));
    // console.log(fm.getProvider());
    dispatch(connect());
  };


  return (
    <div>
      <Button
        className={'sm:hidden'}
        size={ButtonSize.MEDIUM}
        variant={ButtonVariant.PRIMARY}
        onClick={() => login()}
      >
        Connect
      </Button>
      <Button
        className={'hidden sm:block'}
        size={ButtonSize.MEDIUM}
        variant={ButtonVariant.PRIMARY}
        onClick={() => login()}
      >
        Connect Wallet
      </Button>
    </div>
  );
}

export default App;
