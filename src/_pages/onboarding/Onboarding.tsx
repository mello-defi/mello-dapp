import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { OnboardingStep } from '_redux/types/onboardingTypes';
import useWalletBalance from '_hooks/useWalletBalance';
import { stepAddGasToWallet, stepPerformSwap } from '_redux/reducers/onboardingReducer';
import { setStep } from '_redux/effects/onboardingEffects';
import { getTransactionCount } from '_services/walletService';
import { Button, ButtonSize } from '_components/core/Buttons';
import OnboardingStepRow from '_pages/onboarding/OnboardingStepRow';

export default function Onboarding() {
  const dispatch = useDispatch();
  const currentStep = useSelector((state: AppState) => state.onboarding.currentStep);
  const steps = useSelector((state: AppState) => state.onboarding.steps);
  const tokenSet = useSelector((state: AppState) => state.web3.tokenSet);
  const gasToken = Object.values(tokenSet).find((token) => token.isGasToken);
  const walletBalance = useWalletBalance(gasToken);
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const provider = useSelector((state: AppState) => state.web3.provider);
  const [nextStep, setNextStep] = useState<OnboardingStep | undefined>(undefined);
  const [onboardingInitiated, setOnboardingInitiated] = useState(false);
  const [waitingToAdvance, setWaitingToAdvance] = useState(false);
  useEffect(() => {
    async function getTransactionCountAndAdvance() {
      if (userAddress && provider && currentStep && walletBalance) {
        const transactionCount: number = await getTransactionCount(userAddress, provider);
        if (walletBalance.eq(0) && transactionCount === 0) {
          dispatch(setStep(stepAddGasToWallet));
        } else if (walletBalance.gt(0) && currentStep.number <= stepAddGasToWallet.number) {
          dispatch(setStep(stepPerformSwap));
        }
      }
    }
    getTransactionCountAndAdvance();
  }, [userAddress, walletBalance]);

  const advanceToNextStep = () => {
    setWaitingToAdvance(false);
    setNextStep(currentStep);
  };
  useEffect(() => {
    if (waitingToAdvance) {
      setNextStep(currentStep);
    }
  }, [waitingToAdvance, currentStep]);

  useEffect(() => {
    setWaitingToAdvance(true);
  }, [currentStep]);
  return (
    <div>
      <div className={'px-4 mb-2 flex flex-col text-body'}>
        <span>
          Welcome to the mello onboarding tutorial! This tutorial will bring you step by step
          through the mello platform and its features. You will learn how to create or connect your
          wallet, fund that wallet, and swap, deposit and borrow cryptocurrency. Upon completion,
          you will unlock every feature on the mello platform. Please join{' '}
          <a className={'text-orange'} href={'https://discord.gg/fP39CfXN'}>
            our Discord
          </a>{' '}
          for any further help.
        </span>
        <Button className={'w-full my-2'} onClick={() => setOnboardingInitiated(true)}>
          Begin
        </Button>
      </div>
      {nextStep && onboardingInitiated && (
        <>
          {steps
            .filter((step) => step.number <= nextStep?.number)
            .map((step) => (
              <div key={step.number}>
                {waitingToAdvance && nextStep?.number === step.number ? (
                  <div className={'flex-row-center w-full justify-between text-body px-2'}>
                    <span>Step completed!</span>
                    <Button size={ButtonSize.SMALL} onClick={advanceToNextStep}>
                      Next step
                    </Button>
                  </div>
                ) : (
                  <OnboardingStepRow key={step.number} step={step} />
                )}
              </div>
            ))}
        </>
      )}
    </div>
  );
}
