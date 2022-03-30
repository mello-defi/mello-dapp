import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import useWalletBalances from '_hooks/useWalletBalances';
import { setStep } from '_redux/effects/onboardingEffects';
import { getTransactionCount } from '_services/walletService';
import { Button } from '_components/core/Buttons';
import OnboardingStepRow from '_pages/Onboarding/OnboardingStepRow';
import { DefaultTransition } from '_components/core/Transition';
import { stepAddGasToWallet, stepPerformSwap, steps } from '_pages/Onboarding/OnboardingSteps';
import { BigNumber } from 'ethers';

export default function Onboarding() {
  const dispatch = useDispatch();
  const currentStep = useSelector((state: AppState) => state.onboarding.currentStep);
  const tokenSet = useSelector((state: AppState) => state.web3.tokenSet);
  const gasToken = Object.values(tokenSet).find((token) => token.isGasToken);
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const provider = useSelector((state: AppState) => state.web3.provider);
  const [onboardingInitiated, setOnboardingInitiated] = useState(false);
  const [userBalance, setUserBalance] = useState<BigNumber | undefined>();
  const walletBalances = useWalletBalances();

  useEffect(() => {
    if (gasToken) {
      setUserBalance(walletBalances[gasToken.symbol]?.balance);
    }
  }, [walletBalances, gasToken]);

  useEffect(() => {
    async function getTransactionCountAndAdvance() {
      if (
        userAddress &&
        provider &&
        currentStep &&
        userBalance &&
        currentStep === stepAddGasToWallet.number
      ) {
        const transactionCount: number = await getTransactionCount(userAddress, provider);
        if (userBalance.eq(0) && transactionCount === 0) {
          dispatch(setStep(stepAddGasToWallet.number));
        } else if (userBalance.gt(0) && currentStep <= stepAddGasToWallet.number) {
          dispatch(setStep(stepPerformSwap.number));
        }
      }
    }
    getTransactionCountAndAdvance();
  }, [userAddress, userBalance, currentStep]);

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
            <OnboardingStepRow key={step.number} step={step} />
          ))}
        </>
      )}
    </div>
  );
}
