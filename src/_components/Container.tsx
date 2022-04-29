import { NavLinkDefinition, NavTab } from '_redux/types/uiTypes';
import { DefaultTransition } from '_components/core/Transition';
import { EVMChainIdNumerical } from '_enums/networks';
import React, { Suspense } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import LoginGuard from '_components/LoginGuard';
import PolygonMainnetGuard from '_components/PolygonMainnetGuard';
import FirstTimeUserPrompt from '_components/FirstTimeUserPrompt';
import OnboardingGuard from '_components/OnboardingGuard';
const Dashboard = React.lazy(() => import('_pages/Dashboard'));
const Invest = React.lazy(() => import('_pages/Invest/Invest'));
const Deposit = React.lazy(() => import('_pages/Deposit/Deposit'));
const Borrow = React.lazy(() => import('_pages/Borrow/Borrow'));
const Swap = React.lazy(() => import('_pages/Swap/Swap'));
const Fund = React.lazy(() => import('_pages/Fund/Fund'));
const Wallet = React.lazy(() => import('_pages/Wallet/Wallet'));
const Onboarding = React.lazy(() => import('_pages/Onboarding/Onboarding'));

interface TabContentDefinition {
  tab: NavTab;
  component: JSX.Element;
  hideOnEthereumMainnet?: boolean;
  requiresLogin: boolean;
}
// TODO move somewhere else
export const navLinks: NavLinkDefinition[] = [
  { tab: NavTab.DASHBOARD, title: NavTab.DASHBOARD },
  { tab: NavTab.ONBOARDING, title: NavTab.ONBOARDING },
  { tab: NavTab.SWAP, title: NavTab.SWAP },
  { tab: NavTab.DEPOSIT, title: NavTab.DEPOSIT },
  { tab: NavTab.BORROW, title: NavTab.BORROW },
  { tab: NavTab.INVEST, title: NavTab.INVEST },
  { tab: NavTab.FUND, title: NavTab.FUND }
];
const tabsContent: TabContentDefinition[] = [
  {
    tab: NavTab.DASHBOARD,
    component: <Dashboard />,
    hideOnEthereumMainnet: true,
    requiresLogin: true
  },
  {
    tab: NavTab.INVEST,
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
export default function Container() {
  const isConnected = useSelector((state: AppState) => state.web3.isConnected);
  const onboardingComplete = useSelector((state: AppState) => state.onboarding.complete);
  const onboardingOngoing = useSelector((state: AppState) => state.onboarding.ongoing);
  const network = useSelector((state: AppState) => state.web3.network);
  const activeTab = useSelector((state: AppState) => state.ui.activeTab);
  return (
    <div className={'flex-grow'}>
      <div
        className={
          'mx-2 md:mx-auto md:w-full bg-gray-50 flex flex-col max-w-2xl rounded-2xl shadow-xl mb-2'
        }
      >
        <div className={'rounded-2xl py-4 px-2 sm:px-4'}>
          {onboardingComplete || onboardingOngoing ? (
            <>
              <OnboardingGuard />
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
                            <PolygonMainnetGuard />
                          ) : (
                            <>
                              {tab.requiresLogin && !isConnected ? (
                                <LoginGuard />
                              ) : (
                                <Suspense fallback={<div>Loading...</div>}>
                                  <>{tab.component}</>
                                </Suspense>
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
            <FirstTimeUserPrompt />
          )}
        </div>
      </div>
    </div>
  );
}
