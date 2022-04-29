import { NavLinkDefinition, NavTab } from '_redux/types/uiTypes';
import { DefaultTransition } from '_components/core/Transition';
import { EVMChainIdNumerical } from '_enums/networks';
import React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import LoginGuard from '_components/LoginGuard';
import PolygonMainnetGuard from '_components/PolygonMainnetGuard';
import FirstTimeUserPrompt from '_components/FirstTimeUserPrompt';
import OnboardingGuard from '_components/OnboardingGuard';
import Dashboard from '_pages/Dashboard';
import Invest from '_pages/Invest/Invest';
import Deposit from '_pages/Deposit/Deposit';
import Borrow from '_pages/Borrow/Borrow';
import Swap from '_pages/Swap/Swap';
import Fund from '_pages/Fund/Fund';
import Wallet from '_pages/Wallet/Wallet';
import Onboarding from '_pages/Onboarding/Onboarding';

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
            <FirstTimeUserPrompt />
          )}
        </div>
      </div>
    </div>
  );
}
