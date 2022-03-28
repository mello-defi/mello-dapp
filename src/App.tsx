import React from 'react';
import './App.css';
import { Button, ButtonSize, ButtonVariant } from '_components/core/Buttons';
import { DefaultTransition } from '_components/core/Transition';
import { useDispatch, useSelector } from 'react-redux';
import Deposit from '_pages/Deposit/Deposit';
import Footer from '_components/Footer';
import Header from '_components/header/Header';
import Swap from '_pages/Swap/Swap';
import Borrow from '_pages/Borrow/Borrow';
import { NavTab } from '_redux/types/uiTypes';
import { AppState } from '_redux/store';
import Wallet from '_pages/Wallet/Wallet';
import { EVMChainIdNumerical, EvmNetworkDefinition, evmNetworks } from '_enums/networks';
import { setNetwork } from '_redux/effects/web3Effects';
import Fund from '_pages/Fund/Fund';
import Sidebar from '_components/Sidebar';
import Dashboard from '_pages/Dashboard';
import Onboarding from '_pages/Onboarding/Onboarding';
import { setOnboardingComplete, setOnboardingOngoing } from '_redux/effects/onboardingEffects';
import { setActiveTab } from '_redux/effects/uiEffects';
import { ArrowForward, Info } from '@mui/icons-material';
import Invest from '_pages/Invest/Invest';

function OnboardingGuardButton({
  text,
  onClick,
  complete
}: {
  text: string;
  onClick: (complete: boolean) => void;
  complete: boolean;
}) {
  const handleClick = () => {
    onClick(complete);
  };
  return (
    <Button onClick={handleClick} className={'w-1/4'} size={ButtonSize.LARGE}>
      {text}
    </Button>
  );
}

function OnboardingGuard() {
  const dispatch = useDispatch();
  const onClickOnboardingButton = (complete: boolean) => {
    dispatch(setOnboardingComplete(complete));
    if (!complete) {
      dispatch(setOnboardingOngoing(true));
      dispatch(setActiveTab(NavTab.ONBOARDING));
    }
  };
  return (
    <div className={'flex flex-col'}>
      <span className={'text-2xl text-center'}>Is this your first time using mello?</span>
      <div className={'flex-row-center w-full justify-center space-x-2 my-2'}>
        <OnboardingGuardButton text={'Yes'} onClick={onClickOnboardingButton} complete={false} />
        <OnboardingGuardButton text={'No'} onClick={onClickOnboardingButton} complete={true} />
      </div>
    </div>
  );
}

// TODOgeneral
// retry failed requests with expontential backoff
// standardise viewing/granting token allowances
// constants for URLs (aave etc)
// Env vars for environment based config (alchemy)
function EthereumMainnetGuard() {
  const dispatch = useDispatch();
  const changeNetwork = (networkTemp: EvmNetworkDefinition) => {
    dispatch(setNetwork(networkTemp));
  };
  return (
    <div className={'flex flex-col items-center justify-center'}>
      <div className={'flex flex-col items-center justify-center'}>
        <span className={'text-body'}>Please switch to Polygon mainnet</span>
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
    tab: NavTab.DASHBOARD,
    component: <Invest />,
    hideOnEthereumMainnet: true,
    requiresLogin: true
  },
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
  },
  {
    tab: NavTab.ONBOARDING,
    component: <Onboarding />,
    hideOnEthereumMainnet: true,
    requiresLogin: false
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
  const onboardingComplete = useSelector((state: AppState) => state.onboarding.complete);
  const onboardingOngoing = useSelector((state: AppState) => state.onboarding.ongoing);
  const network = useSelector((state: AppState) => state.web3.network);
  const activeTab = useSelector((state: AppState) => state.ui.activeTab);
  const dispatch = useDispatch();
  return (
    <div id={'app'}>
      <Sidebar />
      <div
        // flex flex-col min-h-screen bg-gray-50
        className={`font-sans bg-white-700 ${
          sidebarOpen ? 'transition opacity-50' : ''
          // } flex flex-col min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50`}
        } flex flex-col min-h-screen bg-gray-50`}
      >
        <Header />
        <div className={'flex-grow'}>
          <div
            className={
              'mx-2 md:mx-auto md:w-full bg-gray-50 flex flex-col max-w-2xl rounded-2xl shadow-xl mb-2'
            }
          >
            <div className={'rounded-2xl py-4 px-2 sm:px-4'}>
              {onboardingComplete || onboardingOngoing ? (
                <>
                  {onboardingOngoing && activeTab !== NavTab.ONBOARDING && (
                    <div
                      onClick={() => dispatch(setActiveTab(NavTab.ONBOARDING))}
                      className={
                        'text-header rounded-2xl mb-2 w-full bg-gray-100 p-2 flex-row-center cursor-pointer'
                      }
                    >
                      <span className={'text-3xl ml-2 mr-2'}>
                        <Info className={'text-gray-400 mb-0.5'} fontSize={'inherit'} />
                      </span>
                      <span className={'hover:text-gray-400 transition'}>
                        You must complete onboarding before you can use the app
                      </span>
                      <span className={'text-3xl text-color-light transition hover:text-gray-400'}>
                        <ArrowForward className={'ml-2'} />
                      </span>
                    </div>
                  )}
                  {tabsContent.map((tab) => {
                    return (
                      <DefaultTransition key={tab.tab} isOpen={activeTab === tab.tab}>
                        <div
                          className={`${
                            onboardingOngoing && activeTab !== NavTab.ONBOARDING
                              ? 'opacity-40 pointer-events-none'
                              : ''
                          }`}
                        >
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
                </>
              ) : (
                <OnboardingGuard />
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default App;
