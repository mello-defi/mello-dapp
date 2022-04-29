import { ComputedReserveData } from '@aave/protocol-js';
import React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { AaveSection } from '_enums/aave';
import { getTokenByAddress } from '_utils/index';

export default function AaveReserveApyData({
  reserve,
  aaveSection
}: {
  reserve: ComputedReserveData;
  aaveSection: AaveSection;
}) {
  const tokenSet = useSelector((state: AppState) => state.web3.tokenSet);
  return (
    <div
      key={reserve.id}
      className={'flex flex-col sm:flex-row items-start sm:items-center w-full justify-between'}
    >
      <div className={'flex flex-col'}>
        <div className={'flex-row-center'}>
          {tokenSet && (
            <img
              src={getTokenByAddress(tokenSet, reserve.underlyingAsset).image}
              height={30}
              width={30}
              alt={reserve.name}
            />
          )}
          <span className={'ml-2 text-body flex flex-row items-center'}>
            <div>{reserve.name}</div>
            <div>
              {/*<LightBulbIcon*/}
              {/*  className={*/}
              {/*    'ml-2 rounded-full bg-gray-300 text-white h-7 w-7 p-1 cursor-pointer transition hover:bg-gray-400'*/}
              {/*  }*/}
              {/*/>*/}
            </div>
          </span>
        </div>
      </div>

      <div className={'flex-row-center w-full sm:w-auto justify-between mt-2 sm:mt-0'}>
        <div className={'flex flex-col text-left sm:text-center'}>
          <span className={'text-body font-mono'}>
            {(
              parseFloat(
                aaveSection === AaveSection.Deposit ? reserve.supplyAPY : reserve.variableBorrowAPY
              ) * 100
            ).toFixed(2)}
            %
          </span>
          <span className={'text-body-smaller text-color-light'}>
            {aaveSection === AaveSection.Deposit ? 'Projected' : 'Variable'} APY
          </span>
        </div>
      </div>
    </div>
  );
}
