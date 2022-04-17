import { EvmTokenDefinition } from '_enums/tokens';
import { Button } from '_components/core/Buttons';
import React from 'react';
import { BigNumber, ethers } from 'ethers';
import { ComputedReserveData } from '@aave/protocol-js';
import NextHealthFactor from '_components/aave/NextHealthFactor';
import { HealthFactorImpact, HealthFactorResource } from '_enums/aave';
import SingleCryptoAmountInput from '_components/core/SingleCryptoAmountInput';

export default function AaveFunctionContent({
  reserveTitle,
  summaryTitle,
  userBalance,
  reserve,
  amount,
  setAmount,
  token,
  buttonOnClick,
  buttonDisabled,
  children,
  healthFactorImpact,
  healthFactorResource,
  showMaxButton = true
}: {
  reserveTitle: string;
  reserve: ComputedReserveData;
  summaryTitle: string;
  userBalance: BigNumber | undefined;
  amount: string;
  setAmount: (amount: string) => void;
  token: EvmTokenDefinition;
  buttonOnClick: () => void;
  buttonDisabled: boolean;
  children: React.ReactNode;
  healthFactorImpact: HealthFactorImpact;
  healthFactorResource: HealthFactorResource;
  showMaxButton?: boolean;
}) {
  return (
    <div className={'flex flex-col justify-between space-x-0 md:space-x-2'}>
      <div className={'w-full'}>
        {userBalance && (
          <SingleCryptoAmountInput
            disabled={false}
            amount={amount}
            balance={userBalance}
            amountChanged={setAmount}
            token={token}
            showMaxButton={showMaxButton}
          />
        )}
      </div>

      <div className={'w-full flex flex-col my-2 md:my-0'}>
        <NextHealthFactor
          reserve={reserve}
          amount={amount}
          healthFactorImpact={healthFactorImpact}
          healthFactorResource={healthFactorResource}
        />
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
