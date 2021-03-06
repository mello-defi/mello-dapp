import { BigNumber, Contract, ethers } from 'ethers';
import { TransactionRequest, TransactionResponse } from '@ethersproject/abstract-provider';
import { EvmTokenDefinition, GenericTokenSet } from '_enums/tokens';
import { Interface } from '@ethersproject/abi';
import { ERC20Abi } from '../_abis';
import { WalletTokenBalances } from '_redux/types/walletTypes';
import set from 'lodash/set';

export async function getTransactionCount(
  address: string,
  provider: ethers.providers.Web3Provider
): Promise<number> {
  const txCount: string = await provider.send('eth_getTransactionCount', [address, 'latest']);
  return BigNumber.from(txCount).toNumber();
}
export async function multicall(
  provider: ethers.providers.Web3Provider,
  paths: string[],
  calls: any[],
  abi: any
): Promise<any> {
  // TODO- make network generic, move ABI to file
  const multi = new Contract(
    '0x275617327c958bD06b5D6b871E7f491D76113dd8', // polygon makerdao multicall
    [
      'function tryAggregate(bool requireSuccess, tuple(address, bytes)[] memory calls) public view returns (tuple(bool, bytes)[] memory returnData)'
    ],
    provider
  );
  const itf = new Interface(abi);
  const res: [boolean, string][] = await multi.tryAggregate(
    // if false, allows individual calls to fail without causing entire multicall to fail
    true,
    calls.map((call) => [call[0].toLowerCase(), itf.encodeFunctionData(call[1], call[2])]),
    {}
  );
  const result = {};
  res.forEach(([success, data], i) => {
    const decodedResult = itf.decodeFunctionResult(calls[i][1], data);
    console.log();
    set(
      result,
      paths[i],
      success ? (decodedResult.length > 1 ? decodedResult : decodedResult[0]) : null
    );
  });
  return result;
}
export async function getAllErc20TokenBalances(
  provider: ethers.providers.Web3Provider,
  tokenSet: GenericTokenSet,
  userAddress: string
): Promise<WalletTokenBalances> {
  const paths = [];
  const tokenAddresses = [];
  for (const token of Object.values(tokenSet)) {
    tokenAddresses.push(token.address);
    paths.push(`${token.symbol}.balance`);
  }

  const calls: any[] = tokenAddresses.map((address: string) => [
    address,
    'balanceOf',
    [userAddress]
  ]);

  const res = await multicall(provider, paths, calls, ERC20Abi);
  return res as WalletTokenBalances;
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

export async function getErc20TokenInfo(
  provider: ethers.providers.Web3Provider,
  address: string
): Promise<EvmTokenDefinition> {
  const paths = ['symbol', 'decimals', 'name'];
  const calls: any[] = [
    [address, 'symbol', []],
    [address, 'decimals', []],
    [address, 'name', []]
  ];
  const token: EvmTokenDefinition = await multicall(provider, paths, calls, ERC20Abi);
  token.address = address;
  token.isGasToken = false;
  token.abi = ERC20Abi;
  return token;
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
