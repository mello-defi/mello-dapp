import React, { useEffect } from 'react';
import { Web3Auth } from '@web3auth/web3auth';
import { ADAPTER_EVENTS, CHAIN_NAMESPACES, CONNECTED_EVENT_DATA } from '@web3auth/base';
import { ethers } from 'ethers';
import { useDispatch, useSelector } from 'react-redux';
import { Button, ButtonSize, ButtonVariant } from './core/Buttons';
import { connect, setNetwork } from '_redux/effects/web3Effects';
import { AppState } from '_redux/store';
import { EVMChainIdNumerical } from '_enums/networks';
import Web3Modal, { IProviderOptions } from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { setAddressAction } from '_redux/actions/walletActions';
import { connectAction } from '_redux/actions/web3Actions';

import Torus from "@toruslabs/torus-embed";

const polygonMainnet = {
  rpcUrl: 'https://polygon-mainnet.g.alchemy.com/v2/yAbnaHp8ByhAIrQrplXdhhzQRnB5Lu73', // Your own node URL
  chainId: 137, // Your own node's chainId
};

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
  // const [searchParams, setSearchParams] = useSearchParams();

  const login = async () => {
    const providerOptions: IProviderOptions = {
      walletconnect: {
        package: WalletConnectProvider, // required
        options: {
          // infuraId: '153d6213fae8445cbe45e6fbfc5e15e0'
          rpc: {
            137: 'https://polygon-mainnet.g.alchemy.com/v2/yAbnaHp8ByhAIrQrplXdhhzQRnB5Lu73',
          },
          networkId: 'matic',
        }
      },
      torus: {
        display: {
          logo: "https://www.getopensocial.com/wp-content/uploads/2020/12/social-login-COLOR_2.png",
          name: "Social",
          description: "Sign in with your social media account",
        },
        package: Torus, // required
        options: {
          networkParams: {
            host: "https://polygon-mainnet.g.alchemy.com/v2/yAbnaHp8ByhAIrQrplXdhhzQRnB5Lu73", // optional
            chainId: EVMChainIdNumerical.POLYGON_MAINNET, // optional
          },
        }
      }
    };

    const web3Modal = new Web3Modal({
      network: "mainnet", // optional
      // cacheProvider: true, // optional
      cacheProvider: false, // optional
      disableInjectedProvider: false, // optional
      providerOptions // required
    });
    web3Modal.clearCachedProvider();

    const provider = await web3Modal.connect();
    console.log('PROVIDER', provider);
    // await provider.enable();
    // console.log('PROVIDER', provider);
    // console.ll
    const p = new ethers.providers.Web3Provider(provider, "any");
    const signer = p.getSigner();
    console.log('SIGNER', signer);
    dispatch(connect(p));
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
