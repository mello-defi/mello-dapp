import OnboardingStepDescription from '_pages/Onboarding/OnboardingStepDescription';
import { useEffect, useState } from 'react';
import useWalletBalances from '_hooks/useWalletBalances';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import useInterval from '_hooks/useInterval';
import { setStep } from '_redux/effects/onboardingEffects';
import { stepAddGasToWallet, stepPerformSwap } from '_pages/Onboarding/OnboardingSteps';
import { toggleBalancesAreStale } from '_redux/effects/walletEffects';

export default function StepAddGasToken() {
  const tokenSet = useSelector((state:AppState) => state.web3.tokenSet );
  const walletBalances = useWalletBalances();
  const dispatch = useDispatch();

  const checkBalance = () => {
    const gasToken = Object.values(tokenSet).find(token => token.isGasToken);
    if (gasToken) {
      const balance = walletBalances[gasToken.symbol];
      if (balance && balance.balance.gt(0)) {
        dispatch(setStep(stepAddGasToWallet.number + 1));
      } else {
        dispatch(toggleBalancesAreStale(true))
      }
    }
  }
  useInterval(checkBalance, 2000);

  const whatIsRequired = <>Deposit or buy Matic for your wallet.</>;
  const whyIsRequired = (
    <>
      A gas token is required to perform transactions on a blockchain. These fees are minuscule
      (~$0.01) but without them, you can&apos;t authorise transactions.
      <br />
      <br />
      We recommend you buy €5/$5 to start.
      <br />
      <br />
      Learn more about gas tokens{' '}
      <a
        target="_blank"
        rel="noreferrer"
        href="https://docs.mellodefi.com/introduction/onboarding/add-gas-to-wallet/"
      >
        here
      </a>
    </>
  );

  return (
    <OnboardingStepDescription
      whatIsRequired={whatIsRequired}
      whyIsRequired={whyIsRequired}
    />
  );
}
