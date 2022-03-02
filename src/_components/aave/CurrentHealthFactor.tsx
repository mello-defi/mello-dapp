import React from 'react';
import HealthFactorNumber from '_components/aave/HealthFactorNumber';

export default function CurrentHealthFactor({ healthFactor }: { healthFactor: string }) {
  return (
    <>
      {parseInt(healthFactor) !== -1 && (
        <span className={'text-title flex-row-center justify-between'}>
          <span>Health factor</span>
          <HealthFactorNumber healthFactor={healthFactor} />
        </span>
      )}
    </>
  );
}
