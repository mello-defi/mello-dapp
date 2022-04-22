import { Pool, PoolToken } from '_interfaces/balancer';
import { BigNumber, Contract, ethers } from 'ethers';
import { TransactionRequest, TransactionResponse } from '@ethersproject/abstract-provider';
import { MaxUint256 } from '_utils/maths';
import { isStable } from '_services/balancerCalculatorService';
import { getWriteVaultContract } from '_services/balancerVaultService';
import { StablePoolEncoder, WeightedPoolEncoder } from '_enums/balancer';

const GAS_LIMIT_BUFFER = 0.1;

export async function joinPool(
  pool: Pool,
  userAddress: string,
  signer: ethers.Signer,
  amountsIn: string[],
  gasPrice?: BigNumber
): Promise<TransactionResponse> {
  const vault: Contract = getWriteVaultContract(signer);
  const options: TransactionRequest = {};
  if (gasPrice) {
    options.gasPrice = gasPrice.toString();
  }
  let userData: string;
  if (isStable(pool.poolType)) {
    userData = StablePoolEncoder.joinExactTokensInForBPTOut(amountsIn, BigNumber.from('0'));
  } else {
    userData = WeightedPoolEncoder.joinExactTokensInForBPTOut(amountsIn, BigNumber.from('0'));
  }
  const params = [
    pool.id,
    userAddress,
    userAddress,
    {
      assets: pool.tokens.map((t: PoolToken) => t.address),
      maxAmountsIn: amountsIn,
      fromInternalBalance: false,
      userData
    }
  ];
  return executeBalancerTransaction(vault, 'joinPool', params, options);
}

async function executeBalancerTransaction(
  contract: Contract,
  method: string,
  params: any[],
  options: TransactionRequest
): Promise<TransactionResponse> {
  const gasLimitNumber = await contract.estimateGas[method](...params, options);
  const gasLimit = Math.floor(gasLimitNumber.toNumber() * (1 + GAS_LIMIT_BUFFER));
  options.gasLimit = gasLimit.toString();
  return await contract[method](...params, {
    ...options,
    gasLimit
  });
}
async function exitPool(
  pool: Pool,
  userAddress: string,
  signer: ethers.Signer,
  amountsOut: string[],
  userData: string,
  gasPrice?: BigNumber
): Promise<TransactionResponse> {
  const vault: Contract = getWriteVaultContract(signer);
  const options: TransactionRequest = {};
  if (gasPrice) {
    options.gasPrice = gasPrice.toString();
  }
  const params = [
    pool.id,
    userAddress,
    userAddress,
    {
      assets: pool.tokens.map((t: PoolToken) => t.address),
      minAmountsOut: amountsOut,
      fromInternalBalance: false,
      userData
    }
  ];
  return executeBalancerTransaction(vault, 'exitPool', params, options);
}

export async function exitPoolForOneTokenOut(
  pool: Pool,
  userAddress: string,
  signer: ethers.Signer,
  amountsOut: string[],
  bptAmount: string,
  tokenIndex: number,
  gasPrice?: BigNumber
): Promise<TransactionResponse> {
  let userData: string;
  if (isStable(pool.poolType)) {
    userData = StablePoolEncoder.exitExactBPTInForOneTokenOut(bptAmount, tokenIndex);
  } else {
    userData = WeightedPoolEncoder.exitExactBPTInForOneTokenOut(bptAmount, tokenIndex);
  }
  return await exitPool(pool, userAddress, signer, amountsOut, userData, gasPrice);
}
export async function exitPoolForExactTokensOut(
  pool: Pool,
  userAddress: string,
  signer: ethers.Signer,
  amountsOut: string[],
  gasPrice?: BigNumber
): Promise<TransactionResponse> {
  let userData: string;
  if (isStable(pool.poolType)) {
    userData = StablePoolEncoder.exitBPTInForExactTokensOut(amountsOut, MaxUint256);
  } else {
    userData = WeightedPoolEncoder.exitBPTInForExactTokensOut(amountsOut, MaxUint256);
  }
  return await exitPool(pool, userAddress, signer, amountsOut, userData, gasPrice);
}
