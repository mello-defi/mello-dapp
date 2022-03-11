import React from 'react';

export default function HealthFactorNumber({ healthFactor }: { healthFactor?: string }) {
  const getColor = () => {
    const healthFactorNumber = healthFactor ? parseFloat(healthFactor) : -1;
    if (healthFactorNumber < 1) {
      return 'text-color-light';
    } else if (healthFactorNumber > 1.5) {
      return 'text-green-500';
    } else if (healthFactorNumber < 1.1 && healthFactorNumber > 0) {
      return 'text-yellow-500';
    } else {
      return 'text-red-500';
    }
  };
  return (
    <>
      <span className={`${getColor()}`}>
        {!healthFactor || parseFloat(healthFactor) < 0 ? 'N/A' : parseFloat(healthFactor).toFixed(2)}
      </span>
    </>
  );
}
