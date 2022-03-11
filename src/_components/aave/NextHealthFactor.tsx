import React, { useEffect, useState } from 'react';
import HealthFactorNumber from '_components/aave/HealthFactorNumber';
import { calculateNewHealthFactor } from '_services/aaveService';
import { ComputedReserveData } from '@aave/protocol-js';
import useAaveUserSummary from '_hooks/useAaveUserSummary';
import { HealthFactorImpact, HealthFactorResource } from '_enums/aave';

export default function NextHealthFactor({
  reserve,
  amount,
  healthFactorImpact,
  healthFactorResource
}: {
  reserve: ComputedReserveData;
  amount?: string;
  healthFactorImpact: HealthFactorImpact;
  healthFactorResource: HealthFactorResource;
}) {
  const userSummary = useAaveUserSummary();
  const [healthFactorNumber, setHealthFactorNumber] = useState<string | undefined>(
    userSummary?.healthFactor
  );
  useEffect(() => {
    if (userSummary && amount) {
      setHealthFactorNumber(
        calculateNewHealthFactor(
          reserve,
          userSummary,
          amount,
          healthFactorImpact,
          healthFactorResource
        )
      );
    }
  }, [amount]);
  return (
    <div className={'flex-row-center text-body px-1'}>
      <span className={'mr-2'}>Next health factor</span>
      <HealthFactorNumber healthFactor={healthFactorNumber} />
    </div>
  );
}
