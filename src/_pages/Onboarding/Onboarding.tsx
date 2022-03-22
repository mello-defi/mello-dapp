import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import useWalletBalance from '_hooks/useWalletBalance';
import { setStep } from '_redux/effects/onboardingEffects';
import { getTransactionCount } from '_services/walletService';
import { Button } from '_components/core/Buttons';
import OnboardingStepRow from '_pages/Onboarding/OnboardingStepRow';
import { DefaultTransition } from '_components/core/Transition';
import {
  stepAddGasToWallet,
  stepPerformSwap,
  steps,
  stepSignMessage
} from '_pages/Onboarding/OnboardingSteps';

export default function Onboarding() {
  const dispatch = useDispatch();
  const currentStep = useSelector((state: AppState) => state.onboarding.currentStep);
  const tokenSet = useSelector((state: AppState) => state.web3.tokenSet);
  const gasToken = Object.values(tokenSet).find((token) => token.isGasToken);
  const walletBalance = useWalletBalance(gasToken);
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const provider = useSelector((state: AppState) => state.web3.provider);
  const [onboardingInitiated, setOnboardingInitiated] = useState(false);
  useEffect(() => {
    async function getTransactionCountAndAdvance() {
      if (
        userAddress &&
        provider &&
        currentStep &&
        walletBalance &&
        currentStep !== stepSignMessage.number
      ) {
        const transactionCount: number = await getTransactionCount(userAddress, provider);
        if (walletBalance.eq(0) && transactionCount === 0) {
          dispatch(setStep(stepAddGasToWallet.number));
        } else if (walletBalance.gt(0) && currentStep <= stepAddGasToWallet.number) {
          dispatch(setStep(stepPerformSwap.number));
        }
      }
    }
    getTransactionCountAndAdvance();
  }, [userAddress, walletBalance, currentStep]);

  return (
    <div>
      <DefaultTransition isOpen={!onboardingInitiated}>
        <div className={'px-4 mb-2 flex flex-col text-body'}>
          <p className={'text-center text-2xl'}>Welcome to the mello onboarding tutorial!</p>
          <p>
            Upon completion, you will have learned the basics of DeFi and how to use the mello
            platform. Need help?{' '}
            <a className={'text-orange'} href={'https://discord.gg/fP39CfXN'}>
              Join our Discord!
            </a>{' '}
          </p>
          <div className={'flex justify-center'}>
            <Button className={'w-full md:w-1/2 my-2'} onClick={() => setOnboardingInitiated(true)}>
              Get started
            </Button>
          </div>
        </div>
      </DefaultTransition>
      {onboardingInitiated && (
        <>
          {steps.map((step) => (
            // <div key={step.number}>
            <OnboardingStepRow key={step.number} step={step} />
            // </div>
          ))}
        </>
      )}
    </div>
  );
}
