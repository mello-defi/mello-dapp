import { NavTab } from '_redux/types/uiTypes';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { setActiveTab, toggleSidebar } from '_redux/effects/uiEffects';
import React from 'react';

export default function NavLink({ tab, title }: { tab: NavTab; title: string }) {
  const dispatch = useDispatch();
  const activeTab = useSelector((state: AppState) => state.ui.activeTab);
  const handleClick = () => {
    dispatch(setActiveTab(tab));
    dispatch(toggleSidebar(false));
  };
  const textColor = `hover:text-gray-800 transition ${
    tab !== activeTab ? 'text-gray-500' : 'text-black'
  }`;
  return (
    <div onClick={handleClick} className={'cursor-pointer'}>
      {/*<span>{title}</span>*/}
      <span className={`flex sm:hidden text-3xl my-4 ${textColor}`}>{title}</span>
      <span className={`hidden md:flex mx-2 text-lg ${textColor} sm:text-2xl`}>{title}</span>
    </div>
  );
}
