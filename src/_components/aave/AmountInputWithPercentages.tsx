import React from 'react';
import { Button, ButtonSize, ButtonVariant } from '_components/core/Buttons';

function PercentageButton({
  setAmountAsPercentage,
  percentage,
  userBalance
}: {
  setAmountAsPercentage: (amount: number) => void;
  percentage: number;
  userBalance?: string;
}) {
  return (
    <Button
      className={'h-full w-1/5'}
      disabled={!userBalance || parseFloat(userBalance) === 0}
      variant={ButtonVariant.SECONDARY}
      size={ButtonSize.SMALL}
      onClick={() => setAmountAsPercentage(percentage)}
    >
      {percentage}%
    </Button>
  );
}

export default function AmountInputWithPercentages({
  baseAmount,
  inputAmount,
  setInputAmount
}: {
  baseAmount?: string;
  inputAmount: number;
  setInputAmount: (amount: number) => void;
}) {
  const setAmountAsPercentage = (percentage: number) => {
    if (baseAmount) {
      if (percentage === 100) {
        setInputAmount(parseFloat(baseAmount));
      } else {
        setInputAmount((parseFloat(baseAmount) * percentage) / 100);
      }
    }
  };

  const handleAmountChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseFloat(event.target.value);
    if (baseAmount && val > parseFloat(baseAmount)) {
      val = parseFloat(baseAmount);
    }
    if (val < 0) {
      val = 0;
    }
    setInputAmount(val);
  };
  return (
    <div className={'my-1'}>
      <div>
        <input
          min={0}
          max={baseAmount ? parseFloat(baseAmount) : undefined}
          disabled={!baseAmount || parseFloat(baseAmount) === 0}
          value={inputAmount}
          onChange={handleAmountChanged}
          type={'number'}
          className={`bg-white w-full border-2 my-2 border-gray-100 focus:outline-none rounded-lg px-4 py-2 ${
            !baseAmount || parseFloat(baseAmount) === 0 ? 'text-gray-500' : ''
          }`}
        />
      </div>
      <div className={'flex space-x-2 flex-row justify-between my-1'}>
        <PercentageButton
          percentage={25}
          userBalance={baseAmount}
          setAmountAsPercentage={setAmountAsPercentage}
        />
        <PercentageButton
          percentage={50}
          userBalance={baseAmount}
          setAmountAsPercentage={setAmountAsPercentage}
        />
        <PercentageButton
          percentage={75}
          userBalance={baseAmount}
          setAmountAsPercentage={setAmountAsPercentage}
        />
        <PercentageButton
          percentage={100}
          userBalance={baseAmount}
          setAmountAsPercentage={setAmountAsPercentage}
        />
      </div>
    </div>
  );
}
