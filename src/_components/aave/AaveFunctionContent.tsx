import { TokenDefinition } from '_enums/tokens';
import UserReserveBalance from '_components/aave/UserReserveBalance';
import AmountInputWithPercentages from '_components/aave/AmountInputWithPercentages';
import TransactionAmountSummary from '_components/aave/TransactionAmountSummary';
import { Button } from '_components/core/Buttons';
import React from 'react';

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
  userBalance: string | undefined;
  tokenPrice: number;
  amount: number;
  setAmount: (amount: number) => void;
  token: TokenDefinition;
  buttonOnClick: () => void;
  buttonDisabled: boolean;
  children: any;

}) {
  return (
    <div className={"flex flex-col md:flex-row justify-between space-x-0 md:space-x-2 space-y-2"}>
      <div className={"w-full md:w-1/2"}>
        <UserReserveBalance title={reserveTitle} userBalance={userBalance} tokenPrice={tokenPrice} />
        <AmountInputWithPercentages
          inputAmount={amount}
          setInputAmount={setAmount}
          baseAmount={userBalance}
        />
      </div>
      <div className={"w-full md:w-1/2 flex flex-col justify-end py-0 md:py-2"}>
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
