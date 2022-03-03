import React from 'react';
import { ethers } from 'ethers';
import { TokenDefinition } from '_enums/tokens';
import { OptimalRate } from 'paraswap-core';

export default function SwapPriceInformation({
  fetchingPrices,
  destinationToken,
  priceRoute,
  sourceToken
}: {
  fetchingPrices: boolean;
  destinationToken: TokenDefinition;
  priceRoute?: OptimalRate;
  sourceToken: TokenDefinition;
}) {
  const getDestinationTokenPriceComparison = (): string => {
    if (priceRoute) {
      const srcGwei = ethers.utils.formatUnits(priceRoute.srcAmount, priceRoute.srcDecimals);
      const destGwei = ethers.utils.formatUnits(priceRoute.destAmount, priceRoute.destDecimals);
      return (parseFloat(srcGwei) / parseFloat(destGwei)).toPrecision(6);
    }
    return '';
  };
  return (
    <div
      className={
        'bg-gray-100 text-color-light rounded-2xl px-4 space-y-2 sm:space-y-0 sm:px-6 py-4 my-3 flex flex-col sm:flex-row items-start sm:items-center justify-between'
      }
    >
      {fetchingPrices ? (
        <span>Fetching prices...</span>
      ) : (
        <>
          <div>
            {destinationToken && priceRoute && (
              <>
                <span className={''}>
                  1 {sourceToken.symbol} ={' '}
                  <span className={'font-mono'}>{getDestinationTokenPriceComparison()}</span>{' '}
                  {destinationToken.symbol}
                </span>
              </>
            )}
          </div>
          <div>
            {priceRoute && (
              <div>
                <span className={'ml-2'}>
                  Gas fees:{' '}
                  <span className={'font-mono'}>
                    ~${parseFloat(priceRoute.gasCostUSD).toFixed(2)}
                  </span>
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
