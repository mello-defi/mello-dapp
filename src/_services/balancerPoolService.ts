import { Pool, PoolToken } from '_interfaces/balancer';
import { BigNumber, Contract, ethers } from 'ethers';
import { TransactionRequest, TransactionResponse } from '@ethersproject/abstract-provider';
import { StablePoolEncoder, WeightedPoolEncoder } from '@balancer-labs/sdk';
import { MaxUint256 } from '_utils/maths';
import { isStable } from '_services/balancerCalculatorService';
import { getWriteVaultContract } from '_services/balancerVaultService';

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
    userData = StablePoolEncoder.joinExactTokensInForBPTOut(amountsIn, BigNumber.from('0'))
  } else {
    userData = WeightedPoolEncoder.joinExactTokensInForBPTOut(amountsIn, BigNumber.from('0'))
  }
  return await vault.joinPool(
    pool.id,
    userAddress,
    userAddress,
    {
      assets: pool.tokens.map((t: PoolToken) => t.address),
      maxAmountsIn: amountsIn,
      fromInternalBalance: false,
      userData,
    },
    options
  );
}

export async function exitPool(
  pool: Pool,
  userAddress: string,
  signer: ethers.Signer,
  amountsOut: string[],
  gasPrice?: BigNumber
): Promise<TransactionResponse> {
  const vault: Contract = getWriteVaultContract(signer);
  const options: TransactionRequest = {};
  if (gasPrice) {
    options.gasPrice = gasPrice.toString();
  }
  return await vault.exitPool(
    pool.id,
    userAddress,
    userAddress,
    {
      assets: pool.tokens.map((t: PoolToken) => t.address),
      minAmountsOut: amountsOut,
      fromInternalBalance: false,
      userData: StablePoolEncoder.exitBPTInForExactTokensOut(amountsOut, MaxUint256)
    },
    options
  );
}

