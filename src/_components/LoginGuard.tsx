import React from 'react';

export default function LoginGuard() {
  return (
    <div className={'flex flex-col items-center justify-center h-40'}>
      <div className={'flex flex-col items-center justify-center'}>
        <span className={'text-body'}>Please connect your wallet</span>
      </div>
    </div>
  );
}
