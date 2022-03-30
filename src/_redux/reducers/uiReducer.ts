import {
  NavTab,
  SET_ACTIVE_TAB,
  TOGGLE_SIDEBAR,
  UIActionTypes,
  UIState
} from '_redux/types/uiTypes';

const initialState: UIState = {
  sidebarOpen: false,
  activeTab: NavTab.INVEST
};

export const getUIReducer = (state: UIState = initialState, action: UIActionTypes): UIState => {
  switch (action.type) {
    case TOGGLE_SIDEBAR:
      return {
        ...state,
        sidebarOpen: action.payload
      };
    case SET_ACTIVE_TAB:
      return {
        ...state,
        activeTab: action.payload
      };
    default:
      return state;
  }
};
