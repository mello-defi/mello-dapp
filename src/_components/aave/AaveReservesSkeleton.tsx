import React from 'react';

function AaveReseveSkeletonImage () {
  return (
    <div className="w-12 bg-gray-300 h-12 rounded-full"/>
  )
}

function AaveReserveSkeletonButton () {
  return (
    <div className="ml-2 w-10 md:w-20 bg-gray-300 h-6 md:h-12 rounded-md "/>
  )
}

export default function AaveReservesSkeleton () {
  return (
    <div className="w-full mx-auto">
      <div className="flex animate-pulse flex-col items-start h-full justify-center space-x-5">
        <div className="flex flex-col space-y-3 w-full">
          <div className={"flex-row-center justify-between w-full border-2 rounded-2xl p-4"}>
            <div className={"flex-row-center"}>
              <AaveReseveSkeletonImage/>
              <div className="ml-2 w-20 bg-gray-300 h-6 rounded-md "/>
            </div>
            <div className={"flex flex-col md:flex-row space-y-2 md:space-y-0"}>
              <AaveReserveSkeletonButton/>
              <AaveReserveSkeletonButton/>
            </div>
          </div>
          <div className={"flex-row-center justify-between w-full border-2 rounded-2xl p-4"}>
            <div className={"flex-row-center"}>
              <AaveReseveSkeletonImage/>
              <div className="ml-2 w-40 bg-gray-300 h-6 rounded-md "/>
            </div>
            <div className={"flex flex-col md:flex-row space-y-2 md:space-y-0"}>
              <AaveReserveSkeletonButton/>
              <AaveReserveSkeletonButton/>
            </div>
          </div>
          <div className={"flex-row-center justify-between w-full border-2 rounded-2xl p-4"}>
            <div className={"flex-row-center"}>
              <AaveReseveSkeletonImage/>
              <div className="ml-2 w-32 bg-gray-300 h-6 rounded-md "/>
            </div>
            <div className={"flex flex-col md:flex-row space-y-2 md:space-y-0"}>
              <AaveReserveSkeletonButton/>
              <AaveReserveSkeletonButton/>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}