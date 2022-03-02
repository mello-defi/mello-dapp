import React, { useState } from 'react';
import HealthFactorNumber from '_components/aave/HealthFactorNumber';

export default function NextHealthFactor() {
  const [healthFactorNumber, setHealthFactorNumber] = useState<string>('1.04');
  return (
    <>
      <span>Next health factor</span>
      <HealthFactorNumber healthFactor={healthFactorNumber} />
    </>
  );
}
