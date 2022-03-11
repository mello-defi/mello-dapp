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
  // const baseURL = `https://polygon-mainnet.g.alchemy.com/v2/yAbnaHp8ByhAIrQrplXdhhzQRnB5Lu73`;
  //
  // const data = JSON.stringify({
  //   "jsonrpc": "2.0",
  //   "method": "alchemy_getTokenBalances",
  //   "params": [
  //     `${userAddress}`,
  //     [
  //       `${token.address}`
  //     ]
  //   ],
  //   "id": 1
  // });
  //
  // const config = {
  //   method: 'post',
  //   headers: {
  //     'Content-Type': 'application/json'
  //   },
  //   data : data
  // };
  //
  // const response = await axios.post(baseURL, config);
  // console.log(JSON.stringify(response.data, null, 2))
  // return BigNumber.from(response.data.result.tokenBalances[0].tokenBalance);
}

export async function sendErc20Token(
  token: TokenDefinition,
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
  token: TokenDefinition,
  provider: ethers.providers.Web3Provider,
  userAddress: string,
  spender?: string
): Promise<BigNumber> {
  const contract = new ethers.Contract(token.address, token.abi, provider);
  return contract.allowance(userAddress, spender || contract.address);
}

export async function approveToken(
  token: TokenDefinition,
  signer: ethers.Signer,
  userAddress: string,
  amount: BigNumber,
  gasPrice: BigNumber | undefined,
  spender?: string
): Promise<TransactionResponse> {
  const contract = new ethers.Contract(token.address, token.abi, signer);
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
