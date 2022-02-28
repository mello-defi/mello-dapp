import { Dispatch } from 'redux';
import { NavTab, UIActionTypes } from '_redux/types/uiTypes';
import { setActiveTabAction, toggleSidebarAction } from '_redux/actions/uiActions';

export const toggleSidebar = (isOpen: boolean) => {
  return function (dispatch: Dispatch<UIActionTypes>) {
    dispatch(toggleSidebarAction(isOpen));
  };
};

export const setActiveTab = (tab: NavTab) => {
  return function (dispatch: Dispatch<UIActionTypes>) {
    dispatch(setActiveTabAction(tab));
  };
};
