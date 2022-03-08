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
  DoneRounded, ExpandLess, ExpandMore, Forward,
  Info
} from '@mui/icons-material';
import { setActiveTab } from '_redux/effects/uiEffects';
import useWalletBalance from '_hooks/useWalletBalance';
import { DefaultTransition } from '_components/core/Transition';
import { HorizontalLineBreak } from '_components/core/HorizontalLineBreak';

function OnboardingStepRow({ step }: { step: OnboardingStep }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const currentStep = useSelector((state: AppState) => state.onboarding.currentStep);
  const dispatch = useDispatch();
  const stepIsCurrenStep = currentStep && currentStep.number === step.number;

  const handleClickActiveStep = () => {
    if (stepIsCurrenStep  && currentStep && currentStep.actionTab) {
      dispatch(setActiveTab(currentStep.actionTab));
    }
  }
  return (
    <>
      {currentStep && (
        <>
          <div
            key={step.number}
            className={`py-2 px-4 rounded-2xl border border-gray-100 mb-2 ${
              stepIsCurrenStep ? 'cursor-pointer hover:bg-gray-100 transition' : ''
            }`}
          >
            <div className={'flex flex-row justify-between w-full'}>
              <div className={"flex-row-center"}>
                <span className={'text-3xl mr-2'}>
                  {stepIsCurrenStep ? (
                    <Info className={'text-gray-400 mb-0.5'} fontSize={'inherit'} />
                  ) : (
                    <CheckCircle className={'text-green-400 mb-0.5'} fontSize={'inherit'} />
                  )}
                </span>
                <div className={'flex-row-center'}>
                  <span className={'text-title'}>{step.title}</span>
                  <div
                    onClick={handleClickActiveStep}
                    className={'text-gray-400 hover:text-gray-600 transition ml-2'}>
                    {stepIsCurrenStep && currentStep.actionTab && (
                      <span
                        className={"text-2xl"}>
                      <ArrowForward className={'mb-1'} fontSize={'inherit'} />
                    </span>
                    )}
                  </div>
                </div>
                </div>
                <div
                  onClick={() => {
                    setIsExpanded(!isExpanded);
                  }}
                  className={"text-2xl cursor-pointer text-gray-400 hover:text-gray-600 transition"}>
                  {isExpanded ? (
                    <ExpandLess className={'mb-0.5'} fontSize={'inherit'} />
                  ) : (
                    <ExpandMore className={'mb-0.5'} fontSize={'inherit'} />
                  )}
                </div>
            </div>
            <div className={'flex-row-center w-full text-body-smaller'}>
              <DefaultTransition isOpen={isExpanded}>
                <div>Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum</div>
              </DefaultTransition>
            </div>
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
  const tokenSet = useSelector((state: AppState) => state.web3.tokenSet);
  const gasToken = Object.values(tokenSet).find(token => token.isGasToken);
  // console.log('gastoken',gasToken);
  const walletBalance = useWalletBalance(gasToken);
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const provider = useSelector((state: AppState) => state.web3.provider);
  useEffect(() => {
    if (userAddress && provider && currentStep && walletBalance) {
      (async () => {
        if (walletBalance.gt(0) && currentStep.number <= stepAddGasToWallet.number) {
          dispatch(setStep(stepAddGasToWallet.nextStep));
        } else {
          const transactionCount: number = await getTransactionCount(userAddress, provider);
          if (walletBalance.eq(0) || transactionCount === 0) {
            dispatch(setStep(stepAddGasToWallet));
          }
        }
      })();
    }
  }, [userAddress, walletBalance]);
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
