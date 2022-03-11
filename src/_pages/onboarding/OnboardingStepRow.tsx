import { OnboardingStep } from '_redux/types/onboardingTypes';
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import React, { useState } from 'react';
import { CheckCircle, ExpandLess, ExpandMore, Info } from '@mui/icons-material';
import { DefaultTransition } from '_components/core/Transition';
import OnboardingStepDescription from '_pages/onboarding/OnboardingStepDescription';

export default function OnboardingStepRow({ step }: { step: OnboardingStep }) {
  const currentStep = useSelector((state: AppState) => state.onboarding.currentStep);
  const stepIsCurrentStep = (currentStep && currentStep.number === step.number) || false;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {currentStep && (
        <>
          <div
            key={step.number}
            className={`py-2 px-4 rounded-2xl border border-gray-100 mb-2 ${
              stepIsCurrentStep ? 'cursor-pointer hover:bg-gray-100 transition' : ''
            }`}
          >
            <div className={'flex flex-row justify-between w-full'}>
              <div className={'flex-row-center'}>
                <span className={'text-3xl mr-2'}>
                  {stepIsCurrentStep ? (
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
              <DefaultTransition isOpen={isExpanded || stepIsCurrentStep}>
                <div className={'my-2'}>
                  <OnboardingStepDescription step={step}/>
                </div>
              </DefaultTransition>
            </div>
          </div>
        </>
      )}
      {step.number === currentStep?.number && step.component !== undefined && (
        <>{React.createElement(step.component, step.componentProps)}</>
      )}
    </>
  );
}
