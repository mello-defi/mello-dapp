import { ethers } from 'ethers';
import { TokenDefinition } from '_enums/tokens';
import { useState } from 'react';
import { DefaultTransition } from '_components/core/Transition';

export default function CryptoAmountWithTooltip ({token, amount}: {token: TokenDefinition, amount: string}) {
    const [isHovered, setIsHovered] = useState(false);
    const displayAmount = () => {
      const amountNum = parseFloat(ethers.utils.formatUnits(amount, token.decimals));
      if (amountNum > 0 && amountNum < 0.0001) {
        return '<0.0001';
      }
      return amountNum.toFixed(4);
    }
    return (
      <div

        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}>
        <DefaultTransition isOpen={isHovered}>
          <span className='absolute rounded-xl text-body-smaller shadow-lg p-2 bg-gray-600 text-white -mt-10'>{ethers.utils.formatUnits(amount, token.decimals)}</span>
        </DefaultTransition>
        <span className={'font-mono mr-1'}>
        {displayAmount()}
      </span>
        {token.symbol}
      </div>
    )
  }
