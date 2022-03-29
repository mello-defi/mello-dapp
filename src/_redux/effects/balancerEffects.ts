import { Dispatch } from 'redux';
import { BalancerActionTypes } from '_redux/types/balancerTypes';
import {
  setPoolsAction,
  setUserPoolsAction,
  toggleUserPoolDataStaleAction,
  setTotalInvestedAmountAction
} from '_redux/actions/balancerActions';
import {
  getMiningLiquidityApr,
  getPools,
  getSwapApr,
  getUserPools
} from '_services/balancerService';
import { EvmTokenDefinition, GenericTokenSet } from '_enums/tokens';
import { MarketDataResult } from '_services/marketDataService';
import { Pool, UserPool } from '_interfaces/balancer';
import { ethers } from 'ethers';

export const toggleUserPoolDataStale = (userDataStale: boolean) => {
  return function (dispatch: Dispatch<BalancerActionTypes>) {
    dispatch(toggleUserPoolDataStaleAction(userDataStale));
  };
};

export const setTotalInvestedAmount = (totalAmountInvested: number) => {
  return async function (dispatch: Dispatch<BalancerActionTypes>) {
    dispatch(setTotalInvestedAmountAction(totalAmountInvested));
  };
};

export const getUserPoolsAprs = (
  userPools: UserPool[],
  tokenSet: GenericTokenSet,
  prices: MarketDataResult[],
  provider: ethers.providers.Web3Provider,
  signer: ethers.Signer
) => {
  return async function (dispatch: Dispatch<BalancerActionTypes>) {
    const updatedUserPools: UserPool[] = [...userPools];
    for (const p of updatedUserPools.map(up => up.poolId)) {
      p.liquidityMiningApr = await getMiningLiquidityApr(tokenSet, p, prices);
      p.swapApr = await getSwapApr(p, provider, signer);
      p.totalApr = (p.liquidityMiningApr + p.swapApr).toFixed(2);
    }
    dispatch(setUserPoolsAction(updatedUserPools, true));
  };
};
export const getUserBalancerPools = (userAddress: string) => {
  return async function (dispatch: Dispatch<BalancerActionTypes>) {
    const results = await getUserPools(userAddress);
    dispatch(setUserPoolsAction(results));
  };
};

export const getBalancerPools = (addresses: string[]) => {
  return async function (dispatch: Dispatch<BalancerActionTypes>) {
    const pools = await getPools(addresses);
    dispatch(setPoolsAction(pools));
  };
};

export const getBalancerPoolAprs = (
  pools: Pool[],
  tokenSet: GenericTokenSet,
  prices: MarketDataResult[],
  provider: ethers.providers.Web3Provider,
  signer: ethers.Signer
) => {
  return async function (dispatch: Dispatch<BalancerActionTypes>) {
    const tempPools = [...pools];
    for (const p of tempPools) {
      p.liquidityMiningApr = await getMiningLiquidityApr(tokenSet, p, prices);
      p.swapApr = await getSwapApr(p, provider, signer);
      p.totalApr = (p.liquidityMiningApr + p.swapApr).toFixed(2);
    }
    dispatch(setPoolsAction(tempPools, true));
  };
};
