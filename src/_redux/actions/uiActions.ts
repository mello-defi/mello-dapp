import { NavTab, TOGGLE_SIDEBAR, UIActionTypes } from '_redux/types/uiTypes';

export const toggleSidebarAction = (isOpen: boolean): UIActionTypes => {
  return {
    type: TOGGLE_SIDEBAR,
    payload: isOpen
  };
};

export const setActiveTabAction = (tab: NavTab): UIActionTypes => {
  return {
    type: 'SET_ACTIVE_TAB',
    payload: tab
  };
};
