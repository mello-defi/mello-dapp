import { HorizontalLineBreak } from '_components/core/HorizontalLineBreak';
import MaxAmountButton from '_components/core/MaxAmountButton';
import { Button } from '_components/core/Buttons';
import { BalancerFunction } from '_components/balancer/PoolFunctions';
import React from 'react';

export default function BalancerPoolFunctionSummary({
  sumOfAmountsInFiat,
  handleMaxAmountPressed,
  functionName,
  buttonDisabled,
  onClick
}: {
  sumOfAmountsInFiat: string | null;
  handleMaxAmountPressed: () => void;
  functionName: BalancerFunction;
  buttonDisabled: boolean;
  onClick: () => void;
}) {
  return (
    <div className={'px-4 mt-2'}>
      <HorizontalLineBreak />
      <div className={'flex-row-center mb-2 justify-between text-body'}>
        <div>Total:</div>
        <div className={'flex-row-center'}>
          <div className={'font-mono'}>{sumOfAmountsInFiat ? `$${sumOfAmountsInFiat}` : '-'}</div>
          <MaxAmountButton onClick={handleMaxAmountPressed} />
        </div>
      </div>
      <div>
        <Button disabled={buttonDisabled} className={'w-full'} onClick={onClick}>
          {functionName}
        </Button>
      </div>
    </div>
  );
}
