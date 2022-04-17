import { NavTab } from '_redux/types/uiTypes';
import { setActiveTab } from '_redux/effects/uiEffects';
import { ArrowForward, Info } from '@mui/icons-material';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';

export default function OnboardingGuard() {
  const onboardingOngoing = useSelector((state: AppState) => state.onboarding.ongoing);
  const activeTab = useSelector((state: AppState) => state.ui.activeTab);
  const dispatch = useDispatch();
  return (
   <>
     {onboardingOngoing && activeTab !== NavTab.ONBOARDING && (
       <div
         onClick={() => dispatch(setActiveTab(NavTab.ONBOARDING))}
         className={
           'text-header rounded-2xl mb-2 w-full bg-gray-100 p-2 flex-row-center cursor-pointer'
         }
       >
                  <span className={'text-3xl ml-2 mr-2'}>
                    <Info className={'text-gray-400 mb-0.5'} fontSize={'inherit'} />
                  </span>
         <span className={'hover:text-gray-400 transition'}>
                    You must complete onboarding before you can use the app
                  </span>
         <span className={'text-3xl text-color-light transition hover:text-gray-400'}>
                    <ArrowForward className={'ml-2'} />
                  </span>
       </div>
     )}
   </>
  )
}