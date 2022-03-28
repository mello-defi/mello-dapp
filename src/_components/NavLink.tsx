import { NavTab } from '_redux/types/uiTypes';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { setActiveTab, toggleSidebar } from '_redux/effects/uiEffects';
import React from 'react';

export default function NavLink({ tab, title }: { tab: NavTab; title: string }) {
  const dispatch = useDispatch();
  console.log('NAVLINK', tab, title);
  const activeTab = useSelector((state: AppState) => state.ui.activeTab);
  const onboardingComplete = useSelector((state: AppState) => state.onboarding.complete);
  const ongoing = useSelector((state: AppState) => state.onboarding.ongoing);
  const handleClick = () => {
    dispatch(setActiveTab(tab));
    dispatch(toggleSidebar(false));
  };
  const textColor = `hover:text-gray-700 transition ${
    tab !== activeTab ? 'text-color-light' : 'text-color-dark'
  }`;
  if (tab === NavTab.ONBOARDING && (!ongoing || onboardingComplete)) {
    return null;
  }
  return (
    // <div onClick={handleClick} className={`cursor-pointer ${!onboardingComplete && tab !== NavTab.ONBOARDING ? 'opacity-40' : ''}`}>
    <div onClick={handleClick} className={`cursor-pointer`}>
      {/*<span>{title}</span>*/}
      <span className={`flex sm:hidden text-3xl my-4 ${textColor}`}>{title}</span>
      <span className={`hidden md:flex mx-2 text-lg ${textColor} sm:text-2xl`}>{title}</span>
    </div>
  );
}
