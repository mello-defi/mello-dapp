import { ComputedReserveData, UserSummaryData } from '@aave/protocol-js';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { ComputedUserReserve } from '@aave/protocol-js/dist/v2/types';
import { getReserves, getUserReserves } from '_services/aaveService';
import aaveLogo from '_assets/images/logos/aave.svg';
import PoweredByLink from '_components/core/PoweredByLink';
import ComputedUserReserveListItem from '_components/aave/ComputedUserReserveListItem';
import useMarketPrices from '_hooks/useMarketPrices';
import { findTokenByAddress } from '_enums/tokens';
import { AaveSection } from '_enums/aave';
import AaveReserve from '_components/aave/AaveReserve';
import HealthFactor from '_components/aave/HealthFactor';

export default function Deposit() {
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const tokenSet = useSelector((state: AppState) => state.web3.tokenSet);
  const [computedReserves, setComputedReserves] = useState<ComputedReserveData[] | undefined>(
    undefined
  );
  const [userSummaryData, setUserSummaryData] = useState<UserSummaryData | undefined>(undefined);

  useEffect(() => {
    if (userAddress && computedReserves) {
      getUserReserves(userAddress).then((data: UserSummaryData) => {
        setUserSummaryData(data);
      });
    }
    if (!computedReserves) {
      getReserves().then((reserves: ComputedReserveData[]) => {
        setComputedReserves(reserves);
      });
    }
  }, [computedReserves]);

  return (
    <div className={'space-y-2'}>
      {userSummaryData && userSummaryData.reservesData && userSummaryData.reservesData.length > 0 && (
        <div>
          <div className={'flex-row-center justify-between mb-2'}>
            <span className={'text-title'}>My deposits</span>
            <PoweredByLink url={'https://aave.com/'} logo={aaveLogo} />
          </div>
          {userSummaryData.reservesData
            .filter(
              (reserve: ComputedUserReserve) =>
                parseFloat(parseFloat(reserve.underlyingBalance).toFixed(6)) > 0
            )
            .sort((a, b) => parseFloat(b.underlyingBalance) - parseFloat(a.underlyingBalance))
            .map((reserve: ComputedUserReserve) => {
              return (
                <ComputedUserReserveListItem
                  key={reserve.reserve.symbol}
                  reserveName={reserve.reserve.name}
                  reserveSymbol={reserve.reserve.symbol}
                  reserveAddress={reserve.reserve.underlyingAsset}
                  reserveAmount={reserve.underlyingBalance}
                />
              );
            })}
        </div>
      )}
      {userSummaryData && <HealthFactor healthFactor={userSummaryData.healthFactor} />}
      {userSummaryData &&
        computedReserves?.map((reserve: ComputedReserveData) => {
          return (
            // <></>
            <AaveReserve
              token={findTokenByAddress(tokenSet, reserve.underlyingAsset)}
              aaveSection={AaveSection.Deposit}
              key={reserve.symbol}
              reserve={reserve}
              userReserve={userSummaryData.reservesData.find(
                (r: ComputedUserReserve) => r.reserve.symbol === reserve.symbol
              )}
            />
          );
        })}
    </div>
  );
}
