import { ComputedReserveData } from '@aave/protocol-js';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { ComputedUserReserve } from '@aave/protocol-js/dist/v2/types';
import aaveLogo from '_assets/images/logos/aave.svg';
import PoweredByLink from '_components/core/PoweredByLink';
import ComputedUserReserveListItem from '_components/aave/ComputedUserReserveListItem';
import { AaveSection } from '_enums/aave';
import AaveReserve from '_components/aave/AaveReserve';
import CurrentHealthFactor from '_components/aave/CurrentHealthFactor';
import UserReservesSkeleton from '_components/aave/UserReservesSkeleton';
import AaveReservesSkeleton from '_components/aave/AaveReservesSkeleton';
import useAaveUserSummary from '_hooks/useAaveUserSummary';
import useAaveReserves from '_hooks/useAaveReserves';
import { findTokenByAddress } from '_utils/index';
import { sortUserReservesByKey } from '_services/aaveService';
import { setStep } from '_redux/effects/onboardingEffects';
import { stepDepositAave } from '_redux/reducers/onboardingReducer';

export default function Deposit() {
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const tokenSet = useSelector((state: AppState) => state.web3.tokenSet);

  const dispatch = useDispatch();
  dispatch(setStep(stepDepositAave.nextStep))
  const userSummary = useAaveUserSummary();
  const aaveReserves = useAaveReserves();
  return (
    <div className={'space-y-2'}>
      <div className={'flex-row-center justify-between mb-2'}>
        <span className={'text-header'}>My deposits</span>
        <PoweredByLink url={'https://aave.com/'} logo={aaveLogo} />
      </div>
      {/* REVIEW  (dupe) */}
      {userSummary && userSummary.reservesData ? (
        <div>
          {userSummary.reservesData
            .filter(
              (reserve: ComputedUserReserve) =>
                parseFloat(parseFloat(reserve.underlyingBalance).toFixed(6)) > 0
            )
            .sort((a, b) => parseFloat(b.underlyingBalanceETH) - parseFloat(a.underlyingBalanceETH))
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
      ) : (
        <UserReservesSkeleton />
      )}
      {userSummary && <CurrentHealthFactor healthFactor={userSummary.healthFactor} />}
      {userSummary && aaveReserves ? (
        sortUserReservesByKey(aaveReserves, userSummary.reservesData, 'underlyingBalanceUSD').map(
          (reserve: ComputedReserveData) => {
            return (
              <AaveReserve
                token={findTokenByAddress(tokenSet, reserve.underlyingAsset)}
                aaveSection={AaveSection.Deposit}
                key={reserve.symbol}
                reserve={reserve}
                userReserve={userSummary.reservesData.find(
                  (r: ComputedUserReserve) => r.reserve.symbol === reserve.symbol
                )}
              />
            );
          }
        )
      ) : (
        <AaveReservesSkeleton />
      )}
    </div>
  );
}
