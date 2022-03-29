import { ethers } from 'ethers';
import React from 'react';

export default function MaxAmountButton({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={
        'rounded-2xl text-body-smaller px-2 py-1 bg-gray-200 hover:bg-gray-300 transition ml-1 flex-row-center cursor-pointer'
      }
    >
      Max
    </div>
  );
}
