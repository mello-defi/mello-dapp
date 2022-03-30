import useMarketPrices from '_hooks/useMarketPrices';
import { Pool } from '_interfaces/balancer';
import { HorizontalLineBreak } from '_components/core/HorizontalLineBreak';
import PoolRow from '_components/balancer/PoolRow';
import useBalancerPools from '_hooks/useBalancerPools';
import React from 'react';
import PoolSkeleton from '_components/balancer/PoolSkeleton';
import UserPools from '_components/balancer/UserPools';

export default function Invest() {
  const prices = useMarketPrices();
  const pools = useBalancerPools(prices);
  // TODO - check for chain ID and display balancer of in chain [137, arbitrum] etc
  return (
    <div>
      <UserPools />
      <HorizontalLineBreak />
      <span className={'text-body'}>Investment pools</span>
      {!pools && (
        <div>
          <PoolSkeleton numberOfSymbols={3} />
          <PoolSkeleton numberOfSymbols={2} />
          <PoolSkeleton numberOfSymbols={4} />
        </div>
      )}
      {pools?.map((p: Pool) => {
        return <PoolRow key={p.id} pool={p} />;
      })}
    </div>
  );
}
