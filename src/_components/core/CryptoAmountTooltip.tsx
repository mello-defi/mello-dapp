import { ethers } from 'ethers';
import { EvmTokenDefinition } from '_enums/tokens';
import React, { useState } from 'react';
import { DefaultTransition } from '_components/core/Transition';
import { formatUnits } from 'ethers/lib/utils';

export default function CryptoAmountWithTooltip({
  token,
  amount,
  showSymbol
}: {
  token: EvmTokenDefinition;
  amount: string;
  showSymbol: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const displayAmount = () => {
    const amountNum = parseFloat(formatUnits(amount, token.decimals));
    if (amountNum > 0 && amountNum < 0.0001) {
      return '<0.0001';
    }
    return amountNum.toFixed(4);
  };
  return (
    <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <DefaultTransition isOpen={isHovered}>
        <span className="absolute rounded-xl text-body-smaller shadow-lg p-2 bg-gray-600 text-white -mt-10">
          {formatUnits(amount, token.decimals)}
        </span>
      </DefaultTransition>
      <span className={'font-mono mr-1'}>{displayAmount()}</span>
      {showSymbol && token.symbol}
    </div>
  );
}
