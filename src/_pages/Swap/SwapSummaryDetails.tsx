import SlippageControl from '_pages/Swap/SlippageControl';
import React from 'react';
import { OptimalRate } from 'paraswap-core';
import GasCost from '_pages/Swap/GasCost';

export default function SwapSummaryDetails({
  priceRoute,
  setSlippagePercentage,
  slippagePercentage
}: {
  priceRoute?: OptimalRate;
  slippagePercentage: number;
  setSlippagePercentage: (percentage: number) => void;
}) {
  return (
    <div>
      {priceRoute && (
        <div className={'flex flex-col space-y-2 my-2'}>
          <div className={'flex-row-center justify-between'}>
            <span>Gas cost</span>
            <GasCost gasCostUSD={priceRoute?.gasCostUSD} />
          </div>
          <SlippageControl
            setSlippagePercentage={setSlippagePercentage}
            slippagePercentage={slippagePercentage}
          />
          <div className={'flex-row-center justify-between'}>
            <span>Minimum received after slippage ({slippagePercentage}%)</span>
            <span className={'font-mono'}>
              {priceRoute?.destAmount
                ? `$${((parseFloat(priceRoute.destUSD) / 100) * (100 - slippagePercentage)).toFixed(
                    6
                  )}`
                : '-'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
