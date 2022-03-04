import React from 'react';
import { ethers } from 'ethers';
import { TokenDefinition } from '_enums/tokens';
import { OptimalRate } from 'paraswap-core';
import { EvStation, SettingsRounded } from '@mui/icons-material';
import { Spinner } from '_components/core/Animations';
import { DefaultTransition } from '_components/core/Transition';
import SlippageControl from '_pages/swap/SlippageControl';

export default function SwapPriceInformation({
  fetchingPrices,
  destinationToken,
  priceRoute,
  sourceToken,
  slippagePercentage
}: {
  fetchingPrices: boolean;
  destinationToken: TokenDefinition;
  priceRoute?: OptimalRate;
  sourceToken: TokenDefinition;
  slippagePercentage: number;
}) {
  const [isExpanded, setIsExpanded] = React.useState(false);
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
      onClick={() => {
        setIsExpanded(!isExpanded);
      }}
      className={
        'bg-gray-100 hover:bg-gray-200 cursor-pointer text-color-light rounded-2xl px-4 space-y-2 sm:space-y-0 sm:px-6 py-4 my-3'
      }
    >
      <div className={'flex flex-row items-start justify-between'}>
        {fetchingPrices ? (
          <div className={'flex-row-center items-start'}>
            <Spinner show={fetchingPrices} />
            <span className={'ml-2'}>Fetching prices...</span>
          </div>
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
            <div className={'flex-row-center'}>
              {priceRoute && (
                <div>
                  <span className={'ml-2 flex-row-center'}>
                    <EvStation className={'h-5'} />
                    <span className={'font-mono ml-1'}>
                      ~${parseFloat(priceRoute.gasCostUSD).toFixed(2)}
                    </span>
                  </span>
                </div>
              )}
              <SettingsRounded className={'ml-2'} />
            </div>
          </>
        )}
      </div>
      <DefaultTransition isOpen={isExpanded}>
        <div>
          <SlippageControl slippagePercentage={slippagePercentage} />
        </div>
      </DefaultTransition>
    </div>
  );
}
