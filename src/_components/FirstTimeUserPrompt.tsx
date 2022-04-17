import { useDispatch } from 'react-redux';
import { setOnboardingComplete, setOnboardingOngoing } from '_redux/effects/onboardingEffects';
import { setActiveTab } from '_redux/effects/uiEffects';
import { NavTab } from '_redux/types/uiTypes';
import React from 'react';
import { Button, ButtonSize } from '_components/core/Buttons';

function FirstTimeUserPromptButton({
  text,
  onClick,
  complete
}: {
  text: string;
  onClick: (complete: boolean) => void;
  complete: boolean;
}) {
  const handleClick = () => {
    onClick(complete);
  };
  return (
    <Button onClick={handleClick} className={'w-1/4'} size={ButtonSize.LARGE}>
      {text}
    </Button>
  );
}
export default function FirstTimeUserPrompt() {
  const dispatch = useDispatch();
  const onClickOnboardingButton = (complete: boolean) => {
    dispatch(setOnboardingComplete(complete));
    if (!complete) {
      dispatch(setOnboardingOngoing(true));
      dispatch(setActiveTab(NavTab.ONBOARDING));
    }
  };
  return (
    <div className={'flex flex-col'}>
      <span className={'text-2xl text-center'}>Is this your first time using mello?</span>
      <div className={'flex-row-center w-full justify-center space-x-2 my-2'}>
        <FirstTimeUserPromptButton text={'Yes'} onClick={onClickOnboardingButton} complete={false} />
        <FirstTimeUserPromptButton text={'No'} onClick={onClickOnboardingButton} complete={true} />
      </div>
    </div>
  );
}
