import React from 'react';
import { EvmTokenDefinition } from '_enums/tokens';
import { ethers } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { getTokenValueInFiat } from '_services/priceService';

export default function TokenConversion({
  sourceToken,
  destinationToken,
  sourceAmount,
  destinationAmount
}: {
  sourceToken: EvmTokenDefinition;
  destinationToken: EvmTokenDefinition;
  sourceAmount: string;
  destinationAmount: string;
}) {
  const getDestinationTokenPriceComparison = (): string => {
    const srcGwei = formatUnits(sourceAmount, sourceToken.decimals);
    const destGwei = formatUnits(destinationAmount, destinationToken.decimals);
    return (parseFloat(destGwei) / parseFloat(srcGwei)).toPrecision(6);
  };
  return (
    <div>
      <span className={''}>
        1 {sourceToken.symbol} ={' '}
        <span className={'font-mono'}>{getDestinationTokenPriceComparison()}</span>{' '}
        {destinationToken.symbol}
      </span>
    </div>
  );
}
