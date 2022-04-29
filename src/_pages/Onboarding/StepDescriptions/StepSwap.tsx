import { parseUnits } from 'ethers/lib/utils';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import OnboardingStepDescription from '_pages/Onboarding/OnboardingStepDescription';
import { AppState } from '_redux/store';

export default function StepSwap() {

  const tokenSet = useSelector((state:AppState) => state.web3.tokenSet );
  const walletBalances = useSelector((state: AppState) => state.wallet.balances);
  let balanceAsString;

  const isBalanceAboveThreshold = (thresholdNumber: string) => {
    const gasToken = Object.values(tokenSet).find(token => token.isGasToken);
    if (gasToken) {
      const balance = walletBalances[gasToken.symbol];
      balanceAsString = balance?.balance.toString();
      const threshold = parseUnits(thresholdNumber, 'gwei');
      if(balance && balance.balance.gt(threshold)) {
        return true;
      }
      return true;
    }
    return false;
  }

  const showAmountTip = isBalanceAboveThreshold('6');

  // const whatIsRequired = (
  //       <>
  //         <span className="text-green-500">
  //           <strong>Tip:</strong>
  //         </span>
  //         <br/>
  //         <span className="text-green-500">
  //           You can swap up to {balanceAsString} MATIC for WBTC.
  //         <span/>
  //      </>
  // )

  const whatIsRequired = (
    <>
      <p>Swap your MATIC tokens for some WBTC</p>
      <span hidden={showAmountTip} className="text-green-500">
        <strong>Tip: You can swap up to {balanceAsString} MATIC for WBTC.</strong>
      </span>
    </>
  )


  const whyIsRequired = (
    <>
      A token swap is the exchanging of one token for another. This allows you to easily exchange
      tokens when you require a token that you don&apos;t currently have.
      <br />
      <br />
      The <span className='font-bold'>top</span> box is how many tokens you want to swap. 
      <br />
      The <span className='font-bold'>bottom</span> box shows you how much you will recieve.

    </>
  );
  return (
    <OnboardingStepDescription whatIsRequired={whatIsRequired} whyIsRequired={whyIsRequired} />
  );
}
