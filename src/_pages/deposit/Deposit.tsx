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
import { sortUserReservesByKey } from '_services/aaveService';
import { setStep } from '_redux/effects/onboardingEffects';
import { stepDepositAave } from '_redux/reducers/onboardingReducer';
import UserDepositSummary from '_pages/deposit/UserDepositSummary';

export default function Deposit() {
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const tokenSet = useSelector((state: AppState) => state.web3.tokenSet);

  const dispatch = useDispatch();
  dispatch(setStep(stepDepositAave.nextStep));
  const userSummary = useAaveUserSummary();
  const aaveReserves = useAaveReserves();
  return (
    <div className={'space-y-2'}>
      <div className={'flex-row-center justify-between mb-2'}>
        <span className={'text-header'}>My deposits</span>
        <PoweredByLink url={'https://aave.com/'} logo={aaveLogo} />
      </div>
      <UserDepositSummary />
      {userSummary && <CurrentHealthFactor healthFactor={userSummary.healthFactor} />}
      {userSummary && aaveReserves ? (
        sortUserReservesByKey(aaveReserves, userSummary.reservesData, 'underlyingBalanceUSD').map(
          (reserve: ComputedReserveData) => {
            return (
              <AaveReserve
                aaveSection={AaveSection.Deposit}
                key={reserve.symbol}
                reserveSymbol={reserve.symbol}
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
