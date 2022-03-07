import React, { useEffect } from 'react';
import { getTransactionCount } from '_services/walletService';
import { setStep } from '_redux/effects/onboardingEffects';
import { stepAddGasToWallet, stepPerformSwap } from '_redux/reducers/onboardingReducer';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { OnboardingStep } from '_redux/types/onboardingTypes';
import {
  ArrowForward,
  CheckCircle,
  CheckCircleOutline,
  CheckCircleOutlineOutlined,
  Done,
  DoneRounded, Forward,
  Info
} from '@mui/icons-material';
import { setActiveTab } from '_redux/effects/uiEffects';

function OnboardingStepRow({ step }: { step: OnboardingStep }) {
  const currentStep = useSelector((state: AppState) => state.onboarding.currentStep);
  const dispatch = useDispatch();
  const stepIsCurrenStep = currentStep && currentStep.number === step.number;

  const handleClickActiveStep = () => {
    if (currentStep && currentStep.actionTab) {
      dispatch(setActiveTab(currentStep.actionTab));
    }
  }
  return (
    <>
      {currentStep && (
        <>
          <div
            key={step.number}
            className={`py-2 px-4 rounded-full border border-gray-100 mb-2 flex-row-center justify-between ${
              stepIsCurrenStep ? 'cursor-pointer hover:bg-gray-100 transition' : ''
            }`}
          >
            <div className={"flex-row-center"}>
              <span className={'text-3xl mr-2'}>
                {stepIsCurrenStep ? (
                  <Info className={'text-gray-400 mb-0.5'} fontSize={'inherit'} />
                ) : (
                  <CheckCircle className={'text-green-400 mb-0.5'} fontSize={'inherit'} />
                )}
              </span>
              <span className={'text-title'}>{step.title}</span>
            </div>
            {stepIsCurrenStep && currentStep.actionTab && (
              <span
                onClick={handleClickActiveStep}
                className={"text-3xl"}>
                <ArrowForward className={'text-gray-400 mb-0.5'} fontSize={'inherit'} />
              </span>
            )}
          </div>
        </>
      )}
    </>
  );
}

export default function Onboarding() {
  const dispatch = useDispatch();
  const currentStep = useSelector((state: AppState) => state.onboarding.currentStep);
  const steps = useSelector((state: AppState) => state.onboarding.steps);
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const provider = useSelector((state: AppState) => state.web3.provider);
  useEffect(() => {
    if (userAddress && provider && currentStep) {
      getTransactionCount(userAddress, provider).then((transactions) => {
        console.log(transactions);
        if (transactions === 0) {
          dispatch(setStep(stepAddGasToWallet));
        } else if (currentStep.number < stepAddGasToWallet.number) {
          dispatch(setStep(stepAddGasToWallet.nextStep));
        }
      });
    }
  }, [userAddress]);
  return (
    <div>
      <span className={'text-header'}>{currentStep?.title}</span>
      <br />
      {currentStep && (
        <>
          {steps
            .filter((step) => step.number <= currentStep.number)
            .map((step) => (
              <OnboardingStepRow key={step.number} step={step} />
            ))}
        </>
      )}
    </div>
  );
}
