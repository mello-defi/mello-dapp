import { BigNumber, ethers } from 'ethers';
import { TransactionRequest, TransactionResponse } from '@ethersproject/abstract-provider';
import { EvmTokenDefinition } from '_enums/tokens';

export async function getTransactionCount(
  address: string,
  provider: ethers.providers.Web3Provider
): Promise<number> {
  const txCount: string = await provider.send('eth_getTransactionCount', [address, 'latest']);
  return BigNumber.from(txCount).toNumber();
}

export async function getErc20TokenBalance(
  token: EvmTokenDefinition,
  provider: ethers.providers.Web3Provider,
  userAddress: string
): Promise<BigNumber> {
  const newContract = new ethers.Contract(token.address, token.abi, provider);
  const balance = await newContract.balanceOf(userAddress);
  return BigNumber.from(balance);
}

export async function sendErc20Token(
  token: EvmTokenDefinition,
  signer: ethers.Signer,
  userAddress: string,
  destinationAddress: string,
  amount: BigNumber,
  gasPrice: BigNumber | undefined
): Promise<TransactionResponse> {
  const newContract = new ethers.Contract(token.address, token.abi, signer);
  const options: TransactionRequest = {};
  if (gasPrice) {
    options.gasPrice = gasPrice.toString();
  }
  return newContract.transferFrom(userAddress, destinationAddress, amount.toString(), options);
}

export async function getTokenAllowance(
  tokenAddress: string,
  tokenAbi: any,
  provider: ethers.providers.Web3Provider,
  userAddress: string,
  spender?: string
): Promise<BigNumber> {
  const contract = new ethers.Contract(tokenAddress, tokenAbi, provider);
  return contract.allowance(userAddress, spender || contract.address);
}

export async function approveToken(
  tokenAddress: string,
  tokenAbi: any,
  signer: ethers.Signer,
  userAddress: string,
  amount: BigNumber,
  gasPrice: BigNumber | undefined,
  spender?: string
): Promise<TransactionResponse> {
  const contract = new ethers.Contract(tokenAddress, tokenAbi, signer);
  const options: TransactionRequest = {};
  if (gasPrice) {
    options.gasPrice = gasPrice.toString();
  }
  return contract.approve(spender || userAddress, amount, options);
}

export async function executeEthTransaction(
  txData: TransactionRequest,
  provider: ethers.providers.Web3Provider,
  gasPrice?: BigNumber | undefined
): Promise<TransactionResponse> {
  const signer = provider.getSigner(txData.from);
  try {
    if (gasPrice) {
      txData.gasPrice = gasPrice.toHexString();
    }
    return await signer.sendTransaction({
      ...txData,
      value: txData.value ? BigNumber.from(txData.value) : undefined
    });
  } catch (e: any) {
    console.error('executeEthTransaction error', e);
    throw e;
  }
}
