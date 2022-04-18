import React from 'react';

export default function UserReservesSkeleton() {
  return (
    <div className="w-full h-24 mx-auto">
      <div className="flex animate-pulse flex-col items-start h-full justify-center space-x-5">
        <div className="flex flex-col space-y-3 w-full">
          <div className={'flex-row-center justify-between w-full'}>
            <div className="w-36 bg-gray-300 h-6 rounded-md " />
            <div className="w-12 bg-gray-300 h-6 rounded-md " />
          </div>
          <div className={'flex-row-center justify-between w-full'}>
            <div className="w-24 bg-gray-300 h-6 rounded-md " />
            <div className="w-12 bg-gray-300 h-6 rounded-md " />
          </div>
          <div className={'flex-row-center justify-between w-full'}>
            <div className="w-40 bg-gray-300 h-6 rounded-md " />
            <div className="w-16 bg-gray-300 h-6 rounded-md " />
          </div>
        </div>
      </div>
    </div>
  );
}
