import React from 'react';

export enum SpinnerSize {
  SMALL = 'h-6 w-6',
  MEDIUM = 'h-8 w-8',
  LARGE = 'h-10 w-10'
}

export function Spinner({ size = SpinnerSize.SMALL, show }: { size?: SpinnerSize; show: boolean }) {
  return (
    <>
      {show && (
        <div
          style={{ borderTopColor: 'transparent' }}
          className={`${size} border-2 border-gray-600 border-solid rounded-full animate-spin`}
        />
      )}
    </>
  );
}
