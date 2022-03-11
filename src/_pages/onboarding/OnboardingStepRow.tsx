import { OnboardingStep } from '_redux/types/onboardingTypes';
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import React, { useState } from 'react';
import { CheckCircle, ExpandLess, ExpandMore, Info } from '@mui/icons-material';
import { DefaultTransition } from '_components/core/Transition';

export default function OnboardingStepRow({ step }: { step: OnboardingStep }) {
  const currentStep = useSelector((state: AppState) => state.onboarding.currentStep);
  const stepIsCurrentStep = currentStep && currentStep.number === step.number || false;
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
                  {step.description.text ? (
                    <span dangerouslySetInnerHTML={{__html: step.description.text}}/>
                  ): (
                    <>
                      {step.description.whatIsRequired && step.description.whyIsRequired && (
                        <>
                          <span className={'font-bold text-body'}>What is required?</span>
                          <br/>
                          <span className={'text-body-smaller'} dangerouslySetInnerHTML={{__html: step.description.whatIsRequired}}/>
                          <br/>
                          <br/>
                          <span className={'font-bold text-body'}>Why is this required?</span>
                          <br/>
                          <span className={'text-body-smaller'} dangerouslySetInnerHTML={{__html: step.description.whyIsRequired}}/>
                          {step.description.notes && (
                            <>
                              <br/>
                              <span className={'italic'}>Notes:{' '}
                                <span dangerouslySetInnerHTML={{__html: step.description.notes}}/>
                          </span>
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}
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
