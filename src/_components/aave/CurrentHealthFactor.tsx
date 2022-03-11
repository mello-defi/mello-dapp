import React from 'react';
import HealthFactorNumber from '_components/aave/HealthFactorNumber';

export default function CurrentHealthFactor({ healthFactor }: { healthFactor?: string }) {
  return (
    <>
      {healthFactor && parseFloat(healthFactor) > 0 && (
        <span className={'text-body flex-row-center justify-between'}>
          <span>Health factor</span>
          <HealthFactorNumber healthFactor={healthFactor} />
        </span>
      )}
    </>
  );
}
