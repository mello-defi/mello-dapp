import React from 'react';
import './App.css';
import { Button, ButtonSize, ButtonVariant } from '_components/core/Buttons';
import { DefaultTransition } from '_components/core/Transition';
import { useDispatch, useSelector } from 'react-redux';
import Deposit from '_pages/Deposit';
import Footer from '_components/Footer';
import Header from '_components/Header';
import Swap from '_pages/swap/Swap';
import Borrow from '_pages/Borrow';
import { NavTab } from '_redux/types/uiTypes';
import { AppState } from '_redux/store';
import Wallet from '_pages/Wallet';
// declare module '@biconomy/hyphen'
// @ts-ignore
import { EthereumTestnetGoerliContracts, ethereumTokens } from '_enums/tokens';
import { EVMChainIdNumerical, EvmNetworkDefinition, evmNetworks } from '_enums/networks';
import { setNetwork } from '_redux/effects/web3Effects';
import Fund from '_pages/Fund';
import Sidebar from '_components/Sidebar';

import { jitsuClient } from '@jitsu/sdk-js'

export enum OnboardingSource {
  FIAT = 'FIAT',
  CRYPTO = 'CRYPTO'
}

export enum CryptoSource {
  EXCHANGE = 'EXCHANGE',
  WALLET = 'WALLET'
}

function OnboardingSourceButton({
  source,
  selectedSource,
  children,
  onClick
}: {
  source: OnboardingSource;
  selectedSource: OnboardingSource | undefined;
  children: any;
  onClick: (source: OnboardingSource) => void;
}) {
  return (
    <Button
      size={ButtonSize.LARGE}
      variant={ButtonVariant.PRIMARY}
      className={`mb-2 ${selectedSource === source ? 'bg-gray-600' : ''}`}
      onClick={() => onClick(source)}
    >
      <span className={'text-lg'}>{children}</span>
    </Button>
  );
}

function EthereumMainnetGuard() {
  const dispatch = useDispatch();
  const changeNetwork = (networkTemp: EvmNetworkDefinition) => {
    dispatch(setNetwork(networkTemp));
  };
  return (
    <div className={'flex flex-col items-center justify-center'}>
      <div className={'flex flex-col items-center justify-center'}>
        <span className={'text-title'}>Please switch to Polygon network</span>
        <Button
          onClick={() => changeNetwork(evmNetworks.polygonMainnet)}
          variant={ButtonVariant.SECONDARY}
          size={ButtonSize.LARGE}
        >
          Switch to Polygon
        </Button>
      </div>
    </div>
  );
}

interface TabContentDefinition {
  tab: NavTab;
  component: JSX.Element;
  hideOnEthereumMainnet?: boolean;
  requiresLogin: boolean;
}

export interface NavLinkDefinition {
  tab: NavTab;
  title: string;
  // hideFromNavBar
}

const navLinks: NavLinkDefinition[] = [
  { tab: NavTab.DEPOSIT, title: 'Deposit' },
  { tab: NavTab.BORROW, title: 'Borrow' },
  { tab: NavTab.SWAP, title: 'Swap' },
  { tab: NavTab.FUND, title: 'Fund' }
  // { tab: NavTab.WALLET, title: 'Wallet' }
];
const tabsContent: TabContentDefinition[] = [
  {
    tab: NavTab.DEPOSIT,
    component: <Deposit />,
    hideOnEthereumMainnet: true,
    requiresLogin: true
  },
  {
    tab: NavTab.BORROW,
    component: <Borrow />,
    hideOnEthereumMainnet: true,
    requiresLogin: true
  },
  {
    tab: NavTab.SWAP,
    component: <Swap />,
    hideOnEthereumMainnet: true,
    requiresLogin: true
  },
  {
    tab: NavTab.FUND,
    component: <Fund />,
    hideOnEthereumMainnet: false,
    requiresLogin: false
  },
  {
    tab: NavTab.WALLET,
    component: <Wallet />,
    hideOnEthereumMainnet: false,
    requiresLogin: true
  }
];

export function TransactionTransition() {
  return <div className={'border-green-400 ml-8 border-l-2 border-dashed'}>&nbsp;</div>;
}

function LoginGuard () {
  return (
    <div className={'flex flex-col items-center justify-center h-40'}>
      <div className={'flex flex-col items-center justify-center'}>
        <span className={'text-title'}>Please connect your wallet</span>
      </div>
    </div>
  )
}

function App() {
  const isConnected = useSelector((state: AppState) => state.web3.isConnected);
  const sidebarOpen = useSelector((state: AppState) => state.ui.sidebarOpen);
  const network = useSelector((state: AppState) => state.web3.network);
  const activeTab = useSelector((state: AppState) => state.ui.activeTab);
  return (
    <div>
      <Sidebar navLinks={navLinks} />
      <div
        // flex flex-col min-h-screen bg-gray-50
        className={`font-sans bg-white-700 ${
          sidebarOpen ? 'transition opacity-50' : ''
        } flex flex-col min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50`}
        // } flex flex-col min-h-screen bg-gray-50`}
      >
        <Header navLinks={navLinks} />
        <div className={'flex-grow'}>
          <div
            className={
              'mx-2 md:mx-auto md:w-full bg-gray-50 flex flex-col max-w-2xl rounded-xl shadow-xl mb-2'
            }
          >
            <div className={'rounded-xl py-4 px-2 sm:px-4'}>
              {tabsContent.map((tab) => {
                return (
                  <DefaultTransition key={tab.tab} isOpen={activeTab === tab.tab}>
                    <div>
                      {tab.tab === activeTab && (
                        <div>
                          {tab.hideOnEthereumMainnet &&
                          network.chainId !== EVMChainIdNumerical.POLYGON_MAINNET ? (
                            <EthereumMainnetGuard />
                          ) : (
                            <>
                              {tab.requiresLogin && !isConnected ? (
                                <LoginGuard />
                              ) : (
                                <>
                                  {tab.component}
                                </>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </DefaultTransition>
                );
              })}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default App;
