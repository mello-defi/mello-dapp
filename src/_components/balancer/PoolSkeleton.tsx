import React from 'react';

export default function PoolSkeleton({ numberOfSymbols }: { numberOfSymbols: number }) {
  return (
    <div className="w-full min-h-16 mx-auto border border-gray-200 p-4 rounded-2xl mb-2">
      <div className="flex animate-pulse flex-col items-start h-full justify-center space-x-5">
        <div className="flex flex-col space-y-3 w-full">
          <div className={'flex flex-col md:flex-row w-full'}>
            <div className={'flex flex-row justify-between w-full md:justify-start space-x-2'}>
              <div className={'flex-row-center'}>
                {Array.from({ length: numberOfSymbols }, (_, index) => (
                  <div key={index} className="w-8 bg-gray-300 h-8 rounded-full" />
                ))}
              </div>
              <div className={'flex-row-center'}>
                {Array.from({ length: numberOfSymbols }, (_, index) => (
                  <div key={index} className="w-12 bg-gray-300 h-8 rounded-2xl" />
                ))}
              </div>
            </div>
            <div
              className={
                'flex flex-row md:flex-col space-y-0 md:space-y-2 mt-2 md:mt-0 space-x-2 md:space-x-0'
              }
            >
              <div className="w-12 bg-gray-300 h-6 rounded-md " />
              <div className="w-12 bg-gray-300 h-6 rounded-md " />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
