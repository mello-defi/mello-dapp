import useMarketPrices from '_hooks/useMarketPrices';
import { Pool } from '_interfaces/balancer';
import { HorizontalLineBreak } from '_components/core/HorizontalLineBreak';
import PoolRow from '_components/balancer/PoolRow';
import useBalancerPools from '_hooks/useBalancerPools';
import React from 'react';
import PoolSkeleton from '_components/balancer/PoolSkeleton';
import UserPools from '_components/balancer/UserPools';
import PoweredByLink from '_components/core/PoweredByLink';
import { balLogo } from '_assets/images';

export default function Invest() {
  const prices = useMarketPrices();
  const pools = useBalancerPools(prices);
  // TODO - check for chain ID and display balancer in chain [137, arbitrum] etc
  return (
    <div>
      <div className={'flex-row-center justify-between px-2'}>
        <div className={'text-header'}>Invest</div>
        <PoweredByLink url={'https://balancer.fi/#/'} logo={balLogo} />
      </div>
      <HorizontalLineBreak />
      <UserPools />
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
