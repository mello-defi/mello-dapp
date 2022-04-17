import React, { ReactNode, useState } from 'react';
import { EvmTokenDefinition } from '_enums/tokens';
import { OptimalRate } from 'paraswap-core';
import { EvStation, ExpandLess, ExpandMore } from '@mui/icons-material';
import { Spinner } from '_components/core/Animations';
import { DefaultTransition } from '_components/core/Transition';
import SlippageControl from '_pages/Swap/SlippageControl';
import TokenConversion from '_pages/Swap/TokenConversion';
import GasCost from '_pages/Swap/GasCost';

export default function SwapSummary({
  children,
  fetchingPrices,
  destinationToken,
  priceRoute,
  sourceToken
}: {
  children: ReactNode;
  fetchingPrices: boolean;
  destinationToken: EvmTokenDefinition;
  priceRoute?: OptimalRate;
  sourceToken: EvmTokenDefinition;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className={'rounded-2xl text-body-smaller space-y-2 sm:space-y-0 px-2 my-4'}>
      <div className={'flex flex-row items-start justify-between'}>
        {fetchingPrices ? (
          <div className={'flex-row-center items-start'}>
            <Spinner show={fetchingPrices} />
            <span className={'ml-2'}>Fetching prices...</span>
          </div>
        ) : (
          <>
            {priceRoute && (
              <>
                <TokenConversion
                  sourceToken={sourceToken}
                  destinationToken={destinationToken}
                  sourceAmount={priceRoute.srcAmount}
                  destinationAmount={priceRoute.destAmount}
                />
                <div className={'flex-row-center'}>
                  {priceRoute && !isExpanded && (
                    <div>
                      <span className={'ml-2 flex-row-center'}>
                        <GasCost gasCostUSD={priceRoute.gasCostUSD} />
                      </span>
                    </div>
                  )}
                  <div
                    onClick={() => {
                      setIsExpanded(!isExpanded);
                    }}
                    className={'ml-2 cursor-pointer'}
                  >
                    {isExpanded ? <ExpandLess /> : <ExpandMore />}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
      <DefaultTransition isOpen={isExpanded && priceRoute !== undefined}>
        <div>{children}</div>
      </DefaultTransition>
    </div>
  );
}
