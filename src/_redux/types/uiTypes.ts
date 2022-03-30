import { AnyAction } from 'redux';

export const TOGGLE_SIDEBAR = 'TOGGLE_SIDEBAR';
export const SET_ACTIVE_TAB = 'SET_ACTIVE_TAB';

export enum NavTab {
  DASHBOARD = 'Dashboard',
  SWAP = 'Swap',
  DEPOSIT = 'Deposit',
  BORROW = 'Borrow',
  FUND = 'Fund',
  WALLET = 'Wallet',
  INVEST = 'Invest',
  ONBOARDING = 'Onboarding'
}

export interface NavLinkDefinition {
  tab: NavTab;
  title: string;
}

export interface UIState {
  sidebarOpen: boolean;
  activeTab: NavTab;
}

interface ToggleSidebarActionType extends AnyAction {
  type: typeof TOGGLE_SIDEBAR;
  payload: boolean;
}

interface SetActiveTabActionType extends AnyAction {
  type: typeof SET_ACTIVE_TAB;
  payload: NavTab;
}

export type UIActionTypes = ToggleSidebarActionType | SetActiveTabActionType;
