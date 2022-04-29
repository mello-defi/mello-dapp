import { EvStation } from '@mui/icons-material';
import React from 'react';

export default function GasCost({ gasCostUSD }: { gasCostUSD: string }) {
  return (
    <div className={'flex-row-center'}>
      <EvStation className={'h-5'} />
      <span className={'font-mono ml-1'}>~${parseFloat(gasCostUSD).toFixed(2)}</span>
    </div>
  );
}
