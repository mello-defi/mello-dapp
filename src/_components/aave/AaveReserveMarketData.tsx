import { ComputedReserveData } from '@aave/protocol-js';
import { Button, ButtonVariant } from '_components/core/Buttons';
import { ChevronDownIcon, ChevronUpIcon, LightBulbIcon } from '@heroicons/react/solid';
import React from 'react';
import { findTokenByAddress } from '_enums/tokens';
import { AaveFeature } from '_components/aave/AaveReserve';
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';

export default function AaveReserveMarketData({
  reserve,
  isExpanded,
  setIsExpanded,
  aaveFeature
}: {
  reserve: ComputedReserveData;
  isExpanded: boolean;
  setIsExpanded: (isExpanded: boolean) => void;
  aaveFeature: AaveFeature;
}) {
  const tokenSet = useSelector((state: AppState) => state.web3.tokenSet);
  return (
    <div
      key={reserve.id}
      className={'flex flex-col sm:flex-row items-start sm:items-center justify-between'}
    >
      <div className={'flex flex-col'}>
        <div className={'flex-row-center'}>
          {tokenSet && (
            <img
              src={findTokenByAddress(tokenSet, reserve.underlyingAsset).image}
              height={30}
              width={30}
              alt={reserve.name}
            />
          )}
          <span className={'ml-2 text-lg flex flex-row items-center'}>
            <div>{reserve.name}</div>
            <div>
              <LightBulbIcon
                className={
                  'ml-2 rounded-full bg-gray-300 text-white h-7 w-7 p-1 cursor-pointer transition hover:bg-gray-400'
                }
              />
            </div>
          </span>
        </div>
      </div>

      <div className={'flex-row-center w-full sm:w-auto justify-between mt-2 sm:mt-0'}>
        <div className={'flex flex-col text-left sm:text-center'}>
          <span className={'text-title'}>
            {(
              parseFloat(
                aaveFeature === AaveFeature.Lend ? reserve.supplyAPY : reserve.variableBorrowAPY
              ) * 100
            ).toFixed(2)}
            %
          </span>
          <span className={'text-title-tab-bar text-gray-500'}>
            {aaveFeature === AaveFeature.Lend ? 'Projected' : 'Variable'} APY
          </span>
        </div>
        <Button
          variant={ButtonVariant.SECONDARY}
          onClick={() => setIsExpanded(!isExpanded)}
          className={'ml-2'}
        >
          <div className={'flex-row-center'}>
            <span>{aaveFeature}</span>
            {isExpanded ? (
              <ChevronUpIcon className="-mr-1 ml-1 h-5 w-5" />
            ) : (
              <ChevronDownIcon className="-mr-1 ml-1 h-5 w-5" />
            )}
          </div>
        </Button>
      </div>
    </div>
  );
}
