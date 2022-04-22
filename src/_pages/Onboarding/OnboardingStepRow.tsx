import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import React, { useEffect, useState } from 'react';
import { CheckCircle, ExpandLess, ExpandMore, Info } from '@mui/icons-material';
import { DefaultTransition } from '_components/core/Transition';
import { HorizontalLineBreak } from '_components/core/HorizontalLineBreak';
import { OnboardingStep } from '_pages/Onboarding/OnboardingSteps';
import { Button, ButtonSize } from '_components/core/Buttons';
import { setStep, setWaitingToAdvance } from '_redux/effects/onboardingEffects';

export default function OnboardingStepRow({ step }: { step: OnboardingStep }) {
  const { currentStep, waitingToAdvance } = useSelector((state: AppState) => state.onboarding);
  const stepIsCurrentStep = (currentStep && currentStep === step.number) || false;
  const stepIsAhead = (currentStep && currentStep < step.number) || false;
  const [isExpanded, setIsExpanded] = useState(false);
  const dispatch = useDispatch();

  const advanceToNextStep = () => {
    dispatch(setWaitingToAdvance(false));
  };

  const forceAdvanceToNextStep = () => {
    dispatch(setStep(step.number + 1));
    dispatch(setWaitingToAdvance(false));
  };

  useEffect(() => {
    if (currentStep === step.number + 1) {
      dispatch(setWaitingToAdvance(true));
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
                <span onClick={forceAdvanceToNextStep} className={'text-3xl mr-2'}>
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
            {/*<span>Current step {currentStep}</span>*/}
            {/*<br/>*/}
            {/*<span>Waiting to advance {waitingToAdvance ? 'yes' : 'no'}</span>*/}
            {/*<br/>*/}
            {/*<span>THIS STEP {step.number}</span>*/}
            {/*<br/>*/}
            <div className={'flex-row-center w-full text-body-smaller'}>
              <DefaultTransition
                isOpen={
                  isExpanded ||
                  (currentStep - 1 === step.number && waitingToAdvance) ||
                  (currentStep === step.number && !waitingToAdvance)
                }
              >
                <div className={'my-2'}>
                  <>{React.createElement(step.descriptionComponent)}</>
                </div>
              </DefaultTransition>
            </div>
            {(step.number === currentStep || waitingToAdvance) &&
              step.actionComponent !== undefined &&
              ((currentStep - 1 === step.number && waitingToAdvance) ||
                !waitingToAdvance ||
                (waitingToAdvance && currentStep === step.number + 1)) && (
                <>
                  <HorizontalLineBreak />
                  <>{React.createElement(step.actionComponent, step.actionComponentProps)}</>
                </>
              )}
            <DefaultTransition isOpen={waitingToAdvance && currentStep === step.number + 1}>
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
