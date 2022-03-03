import React from 'react';
import './App.css';
import { Button, ButtonSize, ButtonVariant } from '_components/core/Buttons';
import { DefaultTransition } from '_components/core/Transition';
import { useDispatch, useSelector } from 'react-redux';
import Deposit from '_pages/Deposit';
import Footer from '_components/Footer';
import Header from '_components/header/Header';
import Swap from '_pages/swap/Swap';
import Borrow from '_pages/Borrow';
import { NavTab } from '_redux/types/uiTypes';
import { AppState } from '_redux/store';
import Wallet from '_pages/wallet/Wallet';
import { EVMChainIdNumerical, EvmNetworkDefinition, evmNetworks } from '_enums/networks';
import { setNetwork } from '_redux/effects/web3Effects';
import Fund from '_pages/Fund';
import Sidebar from '_components/Sidebar';

function EthereumMainnetGuard() {
  const dispatch = useDispatch();
  const changeNetwork = (networkTemp: EvmNetworkDefinition) => {
    dispatch(setNetwork(networkTemp));
  };
  return (
    <div className={'flex flex-col items-center justify-center'}>
      <div className={'flex flex-col items-center justify-center'}>
        <span className={'text-body'}>Please switch to Polygon network</span>
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

function LoginGuard() {
  return (
    <div className={'flex flex-col items-center justify-center h-40'}>
      <div className={'flex flex-col items-center justify-center'}>
        <span className={'text-body'}>Please connect your wallet</span>
      </div>
    </div>
  );
}

function App() {
  const isConnected = useSelector((state: AppState) => state.web3.isConnected);
  const sidebarOpen = useSelector((state: AppState) => state.ui.sidebarOpen);
  const network = useSelector((state: AppState) => state.web3.network);
  const activeTab = useSelector((state: AppState) => state.ui.activeTab);
  return (
    <div id={'app'}>
      <Sidebar />
      <div
        // flex flex-col min-h-screen bg-gray-50
        className={`font-sans bg-white-700 ${
          sidebarOpen ? 'transition opacity-50' : ''
        } flex flex-col min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50`}
        // } flex flex-col min-h-screen bg-gray-50`}
      >
        <Header />
        <div className={'flex-grow'}>
          <div
            className={
              'mx-2 md:mx-auto md:w-full bg-gray-50 flex flex-col max-w-2xl rounded-2xl shadow-xl mb-2'
            }
          >
            <div className={'rounded-2xl py-4 px-2 sm:px-4'}>
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
                                <>{tab.component}</>
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
