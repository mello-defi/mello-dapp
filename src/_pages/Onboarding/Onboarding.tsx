import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import useWalletBalances from '_hooks/useWalletBalances';
import { setOnboardingOngoing, setStep } from '_redux/effects/onboardingEffects';
import { getTransactionCount } from '_services/walletService';
import { Button } from '_components/core/Buttons';
import OnboardingStepRow from '_pages/Onboarding/OnboardingStepRow';
import { DefaultTransition } from '_components/core/Transition';
import {
  stepAddGasToWallet,
  stepConnectWallet,
  stepPerformSwap,
  steps
} from '_pages/Onboarding/OnboardingSteps';
import { BigNumber } from 'ethers';
import { setActiveTab } from '_redux/effects/uiEffects';
import { NavTab } from '_redux/types/uiTypes';

export default function Onboarding() {
  const dispatch = useDispatch();
  const {
    complete: onboardingComplete,
    waitingToAdvance,
    currentStep
  } = useSelector((state: AppState) => state.onboarding);
  const { tokenSet, provider } = useSelector((state: AppState) => state.web3);
  const gasToken = Object.values(tokenSet).find((token) => token.isGasToken);
  const userAddress = useSelector((state: AppState) => state.wallet.address);

  const [onboardingInitiated, setOnboardingInitiated] = useState(false);
  const [userBalance, setUserBalance] = useState<BigNumber | undefined>();
  const walletBalances = useWalletBalances();

  const [buttonDisabled, setIsButtonDisabled] = useState(true);

  useEffect(() => {
    if (gasToken) {
      setUserBalance(walletBalances[gasToken.symbol]?.balance);
    }
  }, [walletBalances, gasToken]);

  useEffect(() => {
    if (onboardingComplete) {
      dispatch(setActiveTab(NavTab.DASHBOARD));
      dispatch(setOnboardingOngoing(false));
    }
  }, [onboardingComplete]);
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
        } else if (userBalance.gt(0) && currentStep < stepAddGasToWallet.number) {
          dispatch(setStep(stepPerformSwap.number));
        }
      }
    }
    getTransactionCountAndAdvance();
    if (currentStep === stepConnectWallet.number && userAddress) {
      dispatch(setStep(stepConnectWallet.number + 1));
    }
  }, [userAddress, userBalance, currentStep]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsButtonDisabled(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <DefaultTransition isOpen={!onboardingInitiated}>
        <div className={'px-4 mb-2 flex flex-col text-body'}>
          <p onClick={() => setOnboardingInitiated(true)} className={'text-center text-2xl'}>
            Welcome to the mello onboarding tutorial!
            <span role="img" aria-label="confetti">
              📝
            </span>
          </p>
          <br></br>
          <p>
            The aim of this tutorial is to teach you the basics of using a DeFi wallet and to guide
            you through the most common steps of the process using{' '}
            <span className="font-bold">real cryptocurrency!</span>
          </p>
          <br></br>
          <p>
            This short tutorial will take maximum <span className="font-bold">5 minutes.</span> This
            is excluding the time it takes to verify your identity if you purchase tokens with
            Credit/Debit card{' '}
            <span role="img" aria-label="card">
              💳
            </span>
            .
          </p>
          <br></br>
          {/* <p>By the end of the tutorial you will have:</p>
            <ul className={'list-dist text'}>
              <li>Created a DeFi wallet</li>
              <li>Bought some gas for your wallet</li>
              <li>Swapped some tokens on a decentralised exchange</li>
              <li>Lent your tokens to the Aave protocol</li>
              <li>Borrowed against your own tokens</li>
              <li>Invested the tokens you just borrowed</li>
              <li>Minted your own NFT</li>
            </ul> */}
          <p>
            Once you have finished the tutorial, you will have full access to mello{' '}
            <span role="img" aria-label="confetti">
              🎉
            </span>
            .
          </p>
          <br></br>
          {/* <p>
            Upon completion, you will have learned the basics of DeFi and how to use the mello
            platform. Need help?{' '}
            <a className={'text-orange'} href={MELLO_DISCORD_URL}>
              Join our Discord!
            </a>{' '}
          </p> */}
          <div className={'flex justify-center'}>
            <Button
              disabled={buttonDisabled}
              className={'w-full md:w-1/2 my-2'}
              onClick={() => setOnboardingInitiated(true)}
            >
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
