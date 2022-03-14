import React from 'react';
import { Button, ButtonSize, ButtonVariant } from '_components/core/Buttons';
import { ethers } from 'ethers';
import { decimalPlacesAreValid } from '_utils/index';

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
      className={'h-10 w-1/5'}
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
  maxAmount,
  inputAmount,
  setInputAmount,
  tokenDecimals
}: {
  maxAmount?: string;
  inputAmount: string;
  setInputAmount: (amount: string) => void;
  tokenDecimals: number;
}) {
  const setAmountAsPercentage = (percentage: number) => {
    if (maxAmount) {
      if (percentage === 100) {
        setInputAmount(maxAmount);
      } else {
        const percentageAsBigNumber = ethers.utils
          .parseUnits(maxAmount, tokenDecimals)
          .div(100)
          .mul(percentage);
        setInputAmount(ethers.utils.formatUnits(percentageAsBigNumber, tokenDecimals));
      }
    }
  };

  const handleAmountChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (maxAmount) {
      let value = event.target.value;
      if (value && !decimalPlacesAreValid(value, tokenDecimals)) {
        value = value.substring(0, value.length - 1);
      }
      if (parseFloat(value) < 0) {
        value = '0.0';
      }
      setInputAmount(value);
    }
  };
  return (
    <div className={'mt-2 md:mt-1'}>
      <div>
        <input
          min={0}
          step={'0.01'}
          max={maxAmount ? parseFloat(maxAmount) : undefined}
          disabled={!maxAmount || parseFloat(maxAmount) === 0}
          onWheel={() => false}
          value={inputAmount}
          onChange={handleAmountChanged}
          type={'number'}
          className={`bg-white font-mono w-full border border-gray-100 transition hover:border-gray-300 focus:border-gray-300 focus:outline-none rounded-lg px-4 py-2 ${
            !maxAmount || parseFloat(maxAmount) === 0 ? 'text-color-light' : ''
          }`}
        />
      </div>
      <div className={'flex space-x-2 flex-row justify-between mt-2'}>
        <PercentageButton
          percentage={25}
          userBalance={maxAmount}
          setAmountAsPercentage={setAmountAsPercentage}
        />
        <PercentageButton
          percentage={50}
          userBalance={maxAmount}
          setAmountAsPercentage={setAmountAsPercentage}
        />
        <PercentageButton
          percentage={75}
          userBalance={maxAmount}
          setAmountAsPercentage={setAmountAsPercentage}
        />
        <PercentageButton
          percentage={100}
          userBalance={maxAmount}
          setAmountAsPercentage={setAmountAsPercentage}
        />
      </div>
    </div>
  );
}
