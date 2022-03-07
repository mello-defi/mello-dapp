import { BigNumber, ethers } from 'ethers';
import { TransactionRequest, TransactionResponse } from '@ethersproject/abstract-provider';
import { TokenDefinition } from '_enums/tokens';

export async function getTransactionCount(
  address: string,
  provider: ethers.providers.Web3Provider
): Promise<number> {
  const txCount: string = await provider.send('eth_getTransactionCount', [address, 'latest']);
  return BigNumber.from(txCount).toNumber();
}

export async function getErc20TokenBalance(
  token: TokenDefinition,
  provider: ethers.providers.Web3Provider,
  userAddress: string,
  precision = 2
): Promise<BigNumber> {
  const newContract = new ethers.Contract(token.address, token.abi, provider);
  const balance = await newContract.balanceOf(userAddress);
  return BigNumber.from(balance);
}

export async function sendErc20Token(
  token: TokenDefinition,
  signer: ethers.Signer,
  userAddress: string,
  destinationAddress: string,
  amount: BigNumber,
  gasPrice?: BigNumber
): Promise<TransactionResponse> {
  const newContract = new ethers.Contract(token.address, token.abi, signer);
  const options: TransactionRequest = {};
  if (gasPrice) {
    options.gasPrice = gasPrice.toString();
  }
  return newContract.transferFrom(userAddress, destinationAddress, amount.toString(), options);
}

export async function getTokenAllowance(
  token: TokenDefinition,
  provider: ethers.providers.Web3Provider,
  userAddress: string
): Promise<BigNumber> {
  const contract = new ethers.Contract(token.address, token.abi, provider);
  return contract.allowance(contract.address, userAddress);
}

export async function approveToken(
  token: TokenDefinition,
  signer: ethers.Signer,
  userAddress: string,
  amount: BigNumber,
  gasPrice?: BigNumber
): Promise<TransactionResponse> {
  const contract = new ethers.Contract(token.address, token.abi, signer);
  const options: TransactionRequest = {};
  if (gasPrice) {
    options.gasPrice = gasPrice.toString();
  }
  return contract.approve(userAddress, amount, options);
}

export async function executeEthTransaction(
  txData: TransactionRequest,
  provider: ethers.providers.Web3Provider,
  waitForReceipt = false,
  customGasLimit?: BigNumber
): Promise<string> {
  const signer = provider.getSigner(txData.from);
  try {
    // const gasPrice = await provider.getGasPrice();
    // if (customGasPrice) txData.gasPrice = BigNumber.from(gasPrice);
    // console.log('GASPRICE', gasPrice);
    // txData.gasPrice = BigNumber.from('0x006fe776018');
    // txData.gasLimit = BigNumber.from('0x05fb5b');
    // REVIEW - get gas here?

    const txResponse: TransactionResponse = await signer.sendTransaction({
      ...txData,
      value: txData.value ? BigNumber.from(txData.value) : undefined
    });
    const txHash = txResponse?.hash;
    if (waitForReceipt) {
      const receipt = await txResponse.wait(1);
      return receipt.transactionHash;
    }
    return txHash;
  } catch (e: any) {
    console.error('executeEthTransaction error', e);
    throw e;
  }
}
