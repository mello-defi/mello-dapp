import React from 'react';

export default function HealthFactor({ healthFactor }: { healthFactor: string }) {
  const getColor = () => {
    const healthFactorNumber = parseFloat(healthFactor);
    if (healthFactorNumber > 1.5) {
      return 'text-green-500';
    } else if (healthFactorNumber < 1.5 && healthFactorNumber > 1) {
      return 'text-yellow-500';
    } else {
      return 'text-red-500';
    }
  };
  return (
    <span className={'text-title flex-row-center justify-between'}>
      <span>Health factor</span>
      <span className={`${getColor()}`}>{parseFloat(healthFactor).toFixed(2)}</span>
    </span>
  );
}
