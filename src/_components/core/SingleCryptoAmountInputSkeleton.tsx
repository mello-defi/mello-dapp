
import React from 'react';

export default function SingleCryptoAmountInputSkeleton() {
  return (
    <div className="w-full min-h-16 mx-auto border bg-gray-100 p-4 rounded-2xl mb-2">
      <div className="flex animate-pulse flex-col items-start h-full justify-center space-x-5">
        <div className="flex flex-col space-y-3 w-full">
          <div className={'flex flex-row w-full'}>
            <div className={'flex flex-col justify-between w-full space-y-2'}>
              <div className="w-24 bg-white h-10 rounded-md" />
              <div className="w-10 bg-white h-6 rounded-md" />
            </div>
            <div
              className={
                'flex flex-col justify-end items-end space-y-2'
              }
            >
              <div className="w-20 bg-white h-10 rounded-md " />
              <div className="w-8 bg-white h-6 rounded-md " />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
