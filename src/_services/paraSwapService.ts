import { APIError, NetworkID, ParaSwap } from 'paraswap';
import { TokenDefinition } from '_enums/tokens';
import { ethers } from 'ethers';
import { OptimalRate } from 'paraswap-core';
import { Allowance, Transaction } from 'paraswap/build/types';
import { BigNumberZD } from '@aave/protocol-js';
import { EVMChainIdNumerical } from '_enums/networks';

let paraSwap: ParaSwap;

export function initialiseParaSwap(
  provider: ethers.providers.Web3Provider,
  chainId: EVMChainIdNumerical
) {
  paraSwap = new ParaSwap(chainId as NetworkID).setWeb3Provider(provider.provider);
}

function responseIsError(response: APIError | any): response is APIError {
  return 'message' in response;
}

export async function getExchangeRate(
  sourceToken: string,
  destinationToken: string,
  srcAmount: string,
  srcDecimals: number,
  destDecimals: number
): Promise<OptimalRate> {
  const response: OptimalRate | APIError = await paraSwap.getRate(
    sourceToken,
    destinationToken,
    srcAmount,
    undefined,
    undefined,
    undefined,
    srcDecimals,
    destDecimals
  );
  if (responseIsError(response)) {
    throw new Error(`Error getting rate: ${response.message}`);
  }
  return response;
}

export async function getAllowance(
  walletAddress: string,
  tokenAddress: string
): Promise<Allowance> {
  const response: Allowance | APIError = await paraSwap.getAllowance(walletAddress, tokenAddress);

  console.log(response);
  if (responseIsError(response)) {
    throw new Error(`Error getting allowance: ${response.message}`);
  }
  return response;
}

export async function approveToken(
  amount: string,
  userAddress: string,
  tokenAddress: string
): Promise<string> {
  return paraSwap.approveToken(amount, userAddress, tokenAddress);
}

export async function buildSwapTransaction(
  sourceToken: TokenDefinition,
  destinationToken: TokenDefinition,
  userAddress: string,
  route: OptimalRate,
  slippagePercentage = 1
): Promise<Transaction> {
  const destinationAmountWithSlippage = new BigNumberZD(route.destAmount)
    .multipliedBy(100 - slippagePercentage)
    .dividedBy(100)
    .toFixed(0);
  const response: Transaction | APIError = await paraSwap.buildTx(
    sourceToken.address,
    destinationToken.address,
    route.srcAmount,
    destinationAmountWithSlippage,
    route,
    userAddress,
    undefined,
    undefined,
    undefined,
    undefined,
    { ignoreChecks: true },
    route.srcDecimals,
    route.destDecimals
  );
  if (responseIsError(response)) {
    throw new Error(`Error building transaction: ${response.message}`);
  }
  // @ts-ignore
  response.gasPrice = parseInt(response.gasPrice);
  return response;
}
