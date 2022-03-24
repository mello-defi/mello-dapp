import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import React, { useEffect, useState } from 'react';
import { CheckCircle, ExpandLess, ExpandMore, Info } from '@mui/icons-material';
import { DefaultTransition } from '_components/core/Transition';
import OnboardingStepDescription from '_pages/Onboarding/OnboardingStepDescription';
import { HorizontalLineBreak } from '_components/core/HorizontalLineBreak';
import { OnboardingStep } from '_pages/Onboarding/OnboardingSteps';
import { Button, ButtonSize } from '_components/core/Buttons';

export default function OnboardingStepRow({ step }: { step: OnboardingStep }) {
  const currentStep = useSelector((state: AppState) => state.onboarding.currentStep);
  const stepIsCurrentStep = (currentStep && currentStep === step.number) || false;
  const stepIsAhead = (currentStep && currentStep < step.number) || false;
  const [isExpanded, setIsExpanded] = useState(false);
  const [waitingToAdvance, setWaitingToAdvance] = useState(false);

  const advanceToNextStep = () => {
    setWaitingToAdvance(false);
  };

  useEffect(() => {
    if (currentStep === step.number + 1) {
      setWaitingToAdvance(true);
    }
  }, [currentStep]);
  return (
    <>
      {currentStep && (
        <>
          <div
            key={step.number}
            className={`py-2 px-4 rounded-2xl border bg-white shadow-sm border-gray-100 mb-2`}
          >
            <div className={'flex flex-row justify-between w-full'}>
              <div className={'flex-row-center'}>
                <span className={'text-3xl mr-2'}>
                  {stepIsCurrentStep || stepIsAhead ? (
                    <Info className={'text-gray-400 mb-0.5'} fontSize={'inherit'} />
                  ) : (
                    <CheckCircle className={'text-green-400 mb-0.5'} fontSize={'inherit'} />
                  )}
                </span>
                <span className={'text-title'}>{step.title}</span>
              </div>
              <div
                onClick={() => {
                  !stepIsCurrentStep && setIsExpanded(!isExpanded);
                }}
                className={'text-2xl cursor-pointer text-gray-400 hover:text-gray-600 transition'}
              >
                {isExpanded ? (
                  <ExpandLess className={'mb-0.5'} fontSize={'inherit'} />
                ) : (
                  <ExpandMore className={'mb-0.5'} fontSize={'inherit'} />
                )}
              </div>
            </div>
            <div className={'flex-row-center w-full text-body-smaller'}>
              <DefaultTransition isOpen={isExpanded || stepIsCurrentStep || waitingToAdvance}>
                <div className={'my-2'}>
                  <>{React.createElement(step.descriptionComponent)}</>
                </div>
              </DefaultTransition>
            </div>
            {step.number === currentStep && step.actionComponent !== undefined && (
              <>
                <HorizontalLineBreak />
                <>{React.createElement(step.actionComponent, step.actionComponentProps)}</>
              </>
            )}
            <DefaultTransition isOpen={waitingToAdvance}>
              <div>
                <HorizontalLineBreak />
                <div className={'flex-row-center w-full justify-between text-body px-2 mb-2'}>
                  <span>Step completed!</span>
                  <Button size={ButtonSize.SMALL} onClick={advanceToNextStep}>
                    Continue
                  </Button>
                </div>
              </div>
            </DefaultTransition>
          </div>
        </>
      )}
    </>
  );
}
