import React from 'react';
import { Button, ButtonSize, ButtonVariant } from '_components/core/Buttons';

function SlippageButton({
  buttonAmount,
  currentAmount,
  onClick
}: {
  buttonAmount: number;
  currentAmount: number;
  onClick: (amount: number) => void;
}) {
  return (
    <Button
      size={ButtonSize.SMALL}
      variant={ButtonVariant.SECONDARY}
      className={`py-2 ${currentAmount === buttonAmount ? 'bg-gray-300' : ''}`}
      onClick={() => onClick(buttonAmount)}
    >
      {buttonAmount}%
    </Button>
  );
}
export default function SlippageControl({
  slippagePercentage,
  setSlippagePercentage
}: {
  slippagePercentage: number;
  setSlippagePercentage: (percentage: number) => void;
}) {
  const onClickButton = (amount: number) => {
    setSlippagePercentage(amount);
  };
  return (
    <div className={'flex-row-center justify-between'}>
      <div>Slippage</div>
      <div className={'space-x-2'}>
        <SlippageButton
          buttonAmount={0.5}
          currentAmount={slippagePercentage}
          onClick={onClickButton}
        />
        <SlippageButton
          buttonAmount={1}
          currentAmount={slippagePercentage}
          onClick={onClickButton}
        />
        <SlippageButton
          buttonAmount={2}
          currentAmount={slippagePercentage}
          onClick={onClickButton}
        />
      </div>
    </div>
  );
}
