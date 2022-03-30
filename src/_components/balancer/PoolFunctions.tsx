import { Pool } from '_interfaces/balancer';
import React, { useState } from 'react';
import { DefaultTransition } from '_components/core/Transition';
import { TabHeader, TabHeaderContainer } from '_components/core/Tabs';
import PoolInvest from '_components/balancer/PoolInvest';
import PoolWithdraw from '_components/balancer/PoolWithdraw';

export enum BalancerFunction {
  Invest = 'Invest',
  Withdraw = 'Withdraw'
}

export default function PoolFunctions({ pool }: { pool: Pool }) {
  const [balancerFunction, setBalancerFunction] = useState<BalancerFunction>(
    BalancerFunction.Invest
  );
  return (
    <div className={'flex flex-col shadow rounded-2xl'}>
      <TabHeaderContainer>
        {[BalancerFunction.Invest, BalancerFunction.Withdraw].map((functionType, index) => (
          <TabHeader
            title={functionType}
            key={index}
            isActive={balancerFunction === functionType}
            onClick={() => setBalancerFunction(functionType)}
          />
        ))}
      </TabHeaderContainer>
      <DefaultTransition isOpen={balancerFunction === BalancerFunction.Invest}>
        <div>
          <PoolInvest pool={pool} />
        </div>
      </DefaultTransition>
      <DefaultTransition isOpen={balancerFunction === BalancerFunction.Withdraw}>
        <div>
          <PoolWithdraw pool={pool} />
        </div>
      </DefaultTransition>
    </div>
  );
}
