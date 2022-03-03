import React, { useState } from 'react';
import { DefaultTransition } from '_components/core/Transition';
import SettingsIcon from '@mui/icons-material/Settings';
import { Button, ButtonSize, ButtonVariant } from '_components/core/Buttons';

// // const slippageOptions = [0.5, 1, 2];
// function SlippageButton ({slippage}: {slippage: number}) {
//   return (
//     <Button
//       className={'h-full w-1/5'}
//       disabled={!userBalance || parseFloat(userBalance) === 0}
//       variant={ButtonVariant.SECONDARY}
//       size={ButtonSize.SMALL}
//       onClick={() => setAmountAsPercentage(percentage)}
//     >
//       {slippage}%
//     </Button>
//   )
//
// }
export default function SlippageControl({slippagePercentage}: {slippagePercentage: number}){
  return (
    <div>

    </div>
  )

}
