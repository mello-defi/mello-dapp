import { TokenDefinition } from '_enums/tokens';
import UserReserveBalance from '_components/aave/UserReserveBalance';
import AmountInputWithPercentages from '_components/aave/AmountInputWithPercentages';
import TransactionAmountSummary from '_components/aave/TransactionAmountSummary';
import { Button } from '_components/core/Buttons';
import React from 'react';
import { BigNumber, ethers } from 'ethers';

export default function AaveFunctionContent({
  reserveTitle,
  summaryTitle,
  userBalance,
  tokenPrice,
  amount,
  setAmount,
  token,
  buttonOnClick,
  buttonDisabled,
  children
}: {
  reserveTitle: string;
  summaryTitle: string;
  userBalance: BigNumber | undefined;
  tokenPrice: number;
  amount: string;
  setAmount: (amount: string) => void;
  token: TokenDefinition;
  buttonOnClick: () => void;
  buttonDisabled: boolean;
  children: any;
}) {
  return (
    <div className={'flex flex-col md:flex-row justify-between space-x-0 md:space-x-2 space-y-2'}>
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

      <div className={'w-full md:w-1/2 flex flex-col justify-end py-0 md:py-2'}>
        <TransactionAmountSummary tokenPrice={tokenPrice} title={summaryTitle} amount={amount} />
        {token && (
          <Button
            onClick={buttonOnClick}
            disabled={buttonDisabled}
            className={'flex-row-center justify-center w-full'}
          >
            {children}
          </Button>
        )}
      </div>
    </div>
  );
}
