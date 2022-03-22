import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import useWalletBalance from '_hooks/useWalletBalance';
import { stepAddGasToWallet, stepPerformSwap, stepSignMessage } from '_redux/reducers/onboardingReducer';
import { setStep } from '_redux/effects/onboardingEffects';
import { getTransactionCount } from '_services/walletService';
import { Button } from '_components/core/Buttons';
import OnboardingStepRow from '_pages/onboarding/OnboardingStepRow';
import { DefaultTransition } from '_components/core/Transition';

export default function Onboarding() {
  const dispatch = useDispatch();
  const currentStep = useSelector((state: AppState) => state.onboarding.currentStep);
  const steps = useSelector((state: AppState) => state.onboarding.steps);
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
        currentStep.number !== stepSignMessage.number
      ) {
        const transactionCount: number = await getTransactionCount(userAddress, provider);
        if (walletBalance.eq(0) && transactionCount === 0) {
          dispatch(setStep(stepAddGasToWallet));
        } else if (walletBalance.gt(0) && currentStep.number <= stepAddGasToWallet.number) {
          dispatch(setStep(stepPerformSwap));
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
