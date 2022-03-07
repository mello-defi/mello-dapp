export const TOGGLE_SIDEBAR = 'TOGGLE_SIDEBAR';
export const SET_ACTIVE_TAB = 'SET_ACTIVE_TAB';

export enum NavTab {
  DASHBOARD = 'DASHBOARD',
  SWAP = 'SWAP',
  DEPOSIT = 'DEPOSIT',
  BORROW = 'BORROW',
  FUND = 'FUND',
  LEARN = 'LEARN',
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
  navLinks: NavLinkDefinition[];
}

interface ToggleSidebarActionType {
  type: typeof TOGGLE_SIDEBAR;
  payload: boolean;
}

interface SetActiveTabActionType {
  type: typeof SET_ACTIVE_TAB;
  payload: NavTab;
}

export type UIActionTypes = ToggleSidebarActionType | SetActiveTabActionType;
