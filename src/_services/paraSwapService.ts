import { APIError, BuildOptions, NetworkID, ParaSwap } from 'paraswap';
import { EvmGasTokenBurnAddress, EvmTokenDefinition } from '_enums/tokens';
import { BigNumber, ethers } from 'ethers';
import { OptimalRate } from 'paraswap-core';
import { Transaction } from 'paraswap/build/types';
import { BigNumberZD as AdvancedBigNumber } from '@aave/protocol-js';
import { EVMChainIdNumerical } from '_enums/networks';

let paraSwap: ParaSwap;

export function initialiseParaSwap(
  provider: ethers.providers.Web3Provider,
  chainId: EVMChainIdNumerical
) {
  if (!paraSwap) {
    paraSwap = new ParaSwap(chainId as NetworkID).setWeb3Provider(provider.provider);
  }
}

function responseIsError(response: APIError | any): response is APIError {
  return 'message' in response;
}

export async function getExchangeRate(
  sourceToken: EvmTokenDefinition,
  destinationToken: EvmTokenDefinition,
  srcAmount: string
): Promise<OptimalRate> {
  const srcAddress = sourceToken.isGasToken ? EvmGasTokenBurnAddress : sourceToken.address;
  const destAddress = destinationToken.isGasToken
    ? EvmGasTokenBurnAddress
    : destinationToken.address;
  const response: OptimalRate | APIError = await paraSwap.getRate(
    srcAddress,
    destAddress,
    srcAmount,
    undefined,
    undefined,
    undefined,
    sourceToken.decimals,
    destinationToken.decimals
  );
  if (responseIsError(response)) {
    let message = response.message;
    if (response.message === 'ESTIMATED_LOSS_GREATER_THAN_MAX_IMPACT') {
      message = 'Price impact too high';
    }
    throw new Error(`Error getting rate: ${message}`);
  }
  return response;
}

export async function getTokenTransferProxy(): Promise<string> {
  const response: string | APIError = await paraSwap.getTokenTransferProxy();
  if (typeof response !== 'string') {
    throw new Error(`Error getting transfer proxy: ${response.message}`);
  }
  return response;
}

export async function buildSwapTransaction(
  sourceToken: EvmTokenDefinition,
  destinationToken: EvmTokenDefinition,
  userAddress: string,
  route: OptimalRate,
  slippagePercentage: number,
  gasPrice: BigNumber | undefined
): Promise<Transaction> {
  const destinationAmountWithSlippage = new AdvancedBigNumber(route.destAmount)
    .multipliedBy(100 - slippagePercentage)
    .dividedBy(100)
    .toFixed(0);
  const srcAddress = sourceToken.isGasToken ? EvmGasTokenBurnAddress : sourceToken.address;
  const destAddress = destinationToken.isGasToken
    ? EvmGasTokenBurnAddress
    : destinationToken.address;
  const options: BuildOptions = { ignoreChecks: true };
  if (gasPrice) {
    options.gasPrice = gasPrice.toString();
  }
  const response: Transaction | APIError = await paraSwap.buildTx(
    srcAddress,
    destAddress,
    route.srcAmount,
    destinationAmountWithSlippage,
    route,
    userAddress,
    undefined,
    undefined,
    undefined,
    undefined,
    options,
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
