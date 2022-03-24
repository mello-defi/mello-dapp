import { ComputedReserveData } from '@aave/protocol-js';
import React from 'react';
import aaveLogo from '_assets/images/logos/services/aave.svg';
import PoweredByLink from '_components/core/PoweredByLink';
import { AaveSection } from '_enums/aave';
import AaveReserve from '_components/aave/AaveReserve';
import CurrentHealthFactor from '_components/aave/CurrentHealthFactor';
import AaveReservesSkeleton from '_components/aave/AaveReservesSkeleton';
import useAaveUserSummary from '_hooks/useAaveUserSummary';
import useAaveReserves from '_hooks/useAaveReserves';
import { sortUserReservesByKey } from '_services/aaveService';
import UserDepositSummary from '_pages/Deposit/UserDepositSummary';

export default function Deposit() {
  const userSummary = useAaveUserSummary();
  const aaveReserves = useAaveReserves();
  return (
    <div className={'space-y-2'}>
      <div className={'flex-row-center justify-between mb-2'}>
        <span className={'text-header'}>My deposits</span>
        <PoweredByLink url={'https://aave.com/'} logo={aaveLogo} />
      </div>
      <UserDepositSummary />
      <CurrentHealthFactor healthFactor={userSummary?.healthFactor} />
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
