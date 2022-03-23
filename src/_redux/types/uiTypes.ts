import { AnyAction } from 'redux';

export const TOGGLE_SIDEBAR = 'TOGGLE_SIDEBAR';
export const SET_ACTIVE_TAB = 'SET_ACTIVE_TAB';

export enum NavTab {
  DASHBOARD = 'DASHBOARD',
  SWAP = 'SWAP',
  DEPOSIT = 'DEPOSIT',
  BORROW = 'BORROW',
  FUND = 'FUND',
  LEARN = 'LEARN',
  INVEST = 'INVEST',
  WALLET = 'WALLET',
  ONBOARDING = 'ONBOARDING'
}

export interface NavLinkDefinition {
  tab: NavTab;
  title: string;
}

export interface UIState {
  sidebarOpen: boolean;
  activeTab: NavTab;
  // REVIEW move to separate file out of redux
  navLinks: NavLinkDefinition[];
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
