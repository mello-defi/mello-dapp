import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { OnboardingStep } from '_redux/types/onboardingTypes';
import { CheckCircle, ExpandLess, ExpandMore, Info } from '@mui/icons-material';
import { DefaultTransition } from '_components/core/Transition';
import useWalletBalance from '_hooks/useWalletBalance';
import { stepAddGasToWallet, stepDepositAave, stepPerformSwap } from '_redux/reducers/onboardingReducer';
import { setStep } from '_redux/effects/onboardingEffects';
import { getTransactionCount } from '_services/walletService';
import { Button } from '_components/core/Buttons';

function OnboardingStepRow({ step }: { step: OnboardingStep }) {
  const currentStep = useSelector((state: AppState) => state.onboarding.currentStep);
  const stepIsCurrentStep = currentStep && currentStep.number === step.number || false;
  const [isExpanded, setIsExpanded] = React.useState(false);

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
                  Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum
                  has been the industrys standard dummy text ever since the 1500s, when an unknown
                  printer took a galley of type and scrambled it to make a type specimen book. It
                  has survived not only five centuries, but also the leap into electronic
                  typesetting, remaining essentially unchanged. It was popularised in the 1960s with
                  the release of Letraset sheets containing Lorem Ipsum passages, and more recently
                  with desktop publishing software like Aldus PageMaker including versions of Lorem
                  Ipsum
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

export default function Onboarding() {
  const dispatch = useDispatch();
  const currentStep = useSelector((state: AppState) => state.onboarding.currentStep);
  const steps = useSelector((state: AppState) => state.onboarding.steps);
  const tokenSet = useSelector((state: AppState) => state.web3.tokenSet);
  const gasToken = Object.values(tokenSet).find((token) => token.isGasToken);
  const walletBalance = useWalletBalance(gasToken);
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const provider = useSelector((state: AppState) => state.web3.provider);
  const [nextStep, setNextStep] = React.useState<OnboardingStep | undefined>(undefined);
  const [onboardingInitiated, setOnboardingInitiated] = React.useState(false);
  const [waitingToAdvance, setWaitingToAdvance] = React.useState(false);
  useEffect(() => {
    if (userAddress && provider && currentStep && walletBalance) {
      // REVIEW - possibly not correct
      (async () => {
        const transactionCount: number = await getTransactionCount(userAddress, provider);
        if (walletBalance.eq(0) && transactionCount === 0) {
          dispatch(setStep(stepAddGasToWallet));
        } else if (walletBalance.gt(0) && currentStep.number <= stepAddGasToWallet.number) {
          dispatch(setStep(stepPerformSwap));
        }
      })();
    }
  }, [userAddress, walletBalance]);

  // useEffect(() => {
  //   if (waitingToAdvance) {
  //     setNextStep(currentStep);
  //   }
  // }, [waitingToAdvance, currentStep]);
  //
  // useEffect(() => {
  //   setWaitingToAdvance(true)
  // }, [currentStep]);
  return (
    <div>
      <div className={'px-4 mb-2 flex flex-col text-body'}>
        <span>
          Welcome to the mello onboarding tutorial! This tutorial will bring you step by step through the mello platform and its features. You will learn how to create or connect your wallet, fund that wallet, and swap, deposit and borrow cryptocurrency. Upon completion, you will unlock every feature on the mello platform.
          Please join <a className={'text-orange'} href={"https://discord.gg/fP39CfXN"}>our Discord</a> for any further help.
        </span>
        <Button className={'w-full my-2'} onClick={() => setOnboardingInitiated(true)}>Begin</Button>
      </div>
      {currentStep && onboardingInitiated && (
        <>
          {steps
            .filter((step) => step.number <= currentStep?.number)
            .map((step) => (
              // <div key={step.number}>
              //   {waitingToAdvance && currentStep?.number === step.number ? (
              //     <div className={'flex-row-center w-full text-body-smaller'}>
              //       <DefaultTransition isOpen={waitingToAdvance}>
              //         <div className={'my-2'}>
              //           Please wait while we complete the previous step.
              //         </div>
              //       </DefaultTransition>
              //     </div>
              //   ): (
                  <OnboardingStepRow key={step.number} step={step} />
                // )}
              // </div>
            ))}
        </>
      )}
    </div>
  );
}
