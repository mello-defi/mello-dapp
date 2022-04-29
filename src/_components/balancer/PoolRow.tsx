import { Pool } from '_interfaces/balancer';
import PoolTokenIcons from '_components/balancer/PoolTokenIcons';
import PoolTokenSymbols from '_components/balancer/PoolTokenSymbols';
import { Spinner } from '_components/core/Animations';
import { ExpandMore } from '@mui/icons-material';
import { DefaultTransition } from '_components/core/Transition';
import { useEffect, useState } from 'react';
import PoolFunctions from '_components/balancer/PoolFunctions';
import useBalancerPools from '_hooks/useBalancerPools';

export default function PoolRow({
  poolId,
  userBalance,
  allowFunctions = true
}: {
  poolId: string;
  userBalance?: string;
  allowFunctions?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const pools = useBalancerPools();
  const [pool, setPool] = useState<Pool | undefined>(undefined);
  useEffect(() => {
    if (pools && pools.length > 0) {
      setPool(pools.find((p) => p.id === poolId));
    }
  }, [poolId, pools]);
  return (
    <>
      {pool && (
        <div
          key={pool.id}
          className={
            'bg-white rounded-2xl px-2 md:px-4 py-4 mb-2 border-2 -mx-1 border-gray-50 shadow-sm flex flex-col'
          }
        >
          <div className={'flex flex-col md:flex-row items-center justify-between'}>
            <div
              className={'flex-row-center space-x-1 md:space-x-2 justify-between md:w-auto w-full'}
            >
              <PoolTokenIcons tokens={pool.tokens} />
              <PoolTokenSymbols tokens={pool.tokens} />
            </div>
            <div className={'flex-row-center justify-between w-full md:w-auto mt-3 md:mt-0'}>
              <div className={'flex flex-col text-body-smaller text-left md:text-right'}>
                <div className={'font-mono'}>
                  $
                  {parseFloat(userBalance ? userBalance : pool.totalLiquidity).toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }
                  )}
                </div>
                {pool.totalApr ? <div>{pool.totalApr}% APR</div> : <Spinner show={true} />}
              </div>
              {allowFunctions && (
                <div className={'text-3xl'}>
                  <ExpandMore
                    onClick={() => setIsExpanded(!isExpanded)}
                    fontSize={'inherit'}
                    className={
                      'cursor-pointer text-color-light hover:text-black transition ml-2 mb-1'
                    }
                  />
                </div>
              )}
            </div>
          </div>
          <DefaultTransition isOpen={isExpanded}>
            <div className={'mt-2'}>
              <PoolFunctions pool={pool} />
            </div>
          </DefaultTransition>
        </div>
      )}
    </>
  );
}
