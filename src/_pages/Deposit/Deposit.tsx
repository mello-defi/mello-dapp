import { ComputedReserveData } from '@aave/protocol-js';
import React from 'react';
import aaveLogo from '_assets/images/logos/services/aave.svg';
import PoweredByLink from '_components/core/PoweredByLink';
import { AaveSection } from '_enums/aave';
import AaveReserveCard from '_components/aave/AaveReserveCard';
import CurrentHealthFactor from '_components/aave/CurrentHealthFactor';
import AaveReservesSkeleton from '_components/aave/AaveReservesSkeleton';
import useAaveUserSummary from '_hooks/useAaveUserSummary';
import useAaveReserves from '_hooks/useAaveReserves';
import { sortUserReservesByKey } from '_services/aaveService';
import UserDepositSummary from '_pages/Deposit/UserDepositSummary';
import { AAVE_URL } from '_constants/urls';

export default function Deposit() {
  const userSummary = useAaveUserSummary();
  const aaveReserves = useAaveReserves();
  return (
    <div className={'space-y-2'}>
      <div className={'flex-row-center justify-between mb-2'}>
        <span className={'text-header'}>Supplied</span>
        <PoweredByLink url={AAVE_URL} logo={aaveLogo} />
      </div>
      <UserDepositSummary />
      <CurrentHealthFactor healthFactor={userSummary?.healthFactor} />
      {userSummary && aaveReserves ? (
        sortUserReservesByKey(aaveReserves, userSummary.reservesData, 'underlyingBalanceUSD').map(
          (reserve: ComputedReserveData) => {
            return (
              <AaveReserveCard
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
