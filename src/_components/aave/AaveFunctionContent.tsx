import { TokenDefinition } from '_enums/tokens';
import UserReserveBalance from '_components/aave/UserReserveBalance';
import AmountInputWithPercentages from '_components/aave/AmountInputWithPercentages';
import TransactionAmountSummary from '_components/aave/TransactionAmountSummary';
import { Button } from '_components/core/Buttons';
import React from 'react';
import { BigNumber, ethers } from 'ethers';
import { ComputedReserveData } from '@aave/protocol-js';
import NextHealthFactor from '_components/aave/NextHealthFactor';
import { HealthFactorImpact, HealthFactorResource } from '_enums/aave';

export default function AaveFunctionContent({
  reserveTitle,
  summaryTitle,
  userBalance,
  reserve,
  tokenPrice,
  amount,
  setAmount,
  token,
  buttonOnClick,
  buttonDisabled,
  children,
  healthFactorImpact,
  healthFactorResource
}: {
  reserveTitle: string;
  reserve: ComputedReserveData;
  summaryTitle: string;
  userBalance: BigNumber | undefined;
  tokenPrice: number;
  amount: string;
  setAmount: (amount: string) => void;
  token: TokenDefinition;
  buttonOnClick: () => void;
  buttonDisabled: boolean;
  children: any;
  healthFactorImpact: HealthFactorImpact;
  healthFactorResource: HealthFactorResource;
}) {
  return (
    <div className={'flex flex-col md:flex-row justify-between space-x-0 md:space-x-2'}>
      <div className={'w-full md:w-1/2'}>
        {userBalance && (
          <UserReserveBalance
            title={reserveTitle}
            formattedUserAmount={ethers.utils.formatUnits(userBalance, token.decimals)}
            tokenPrice={tokenPrice}
          />
        )}
        {userBalance && (
          <AmountInputWithPercentages
            inputAmount={amount}
            tokenDecimals={token.decimals}
            setInputAmount={setAmount}
            baseAmount={ethers.utils.formatUnits(userBalance?.toString(), token.decimals)}
          />
        )}
      </div>

      <div className={'w-full md:w-1/2 flex flex-col my-2 md:my-0'}>
        <NextHealthFactor
          reserve={reserve}
          amount={amount}
          healthFactorImpact={healthFactorImpact}
          healthFactorResource={healthFactorResource}
        />
        <TransactionAmountSummary tokenPrice={tokenPrice} title={summaryTitle} amount={amount} />
        {token && (
          <Button
            onClick={buttonOnClick}
            disabled={buttonDisabled}
            className={'flex-row-center justify-center w-full my-0.5'}
          >
            {children}
          </Button>
        )}
      </div>
    </div>
  );
}
