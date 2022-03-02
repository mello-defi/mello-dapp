import { BigNumber, ethers } from 'ethers';
import { TransactionRequest, TransactionResponse } from '@ethersproject/abstract-provider';
import { TokenDefinition } from '_enums/tokens';

export async function getErc20TokenBalance(
  token: TokenDefinition,
  provider: ethers.providers.Web3Provider,
  userAddress: string,
  precision = 2
): Promise<BigNumber> {
  const newContract = new ethers.Contract(token.address, token.abi, provider);
  const balance = await newContract.balanceOf(userAddress);
  return BigNumber.from(balance);
  // return parseFloat(ethers.utils.formatUnits(balance.toString(), token.decimals)).toPrecision(
  //   precision
  // );
}

export async function getTokenAllowance(
  token: TokenDefinition,
  provider: ethers.providers.Web3Provider,
  amount: number,
  userAddress: string,
  contractAddress: string,
  waitForConfirmation = true
) {
  // const signer = provider.getSigner();
  //
  // console.log('token', token);
  //
  // const contract = new ethers.Contract(token.address, abi, provider)
  // console.log('contract', contract);
  // const tx = await contract.allowance(userAddress, contract);
  // console.log('TX ALLOWANCE', tx);
}

// export async function approveToken(
//   token: TokenDefinition,
//   provider: ethers.providers.Web3Provider,
//   amount: number,
//   userAddress: string,
//   contractAddress: string,
//   waitForConfirmation = true
// ): Promise<string> {
//   console.log('Approving token...');
//   console.log(`Token: ${token.name}`);
//   console.log(`Address: ${token.address}`);
//   console.log(`Amount: ${amount}`);
//   const abi = [
//     'function totalSupply() public view returns (uint)',
//     'function balanceOf(address tokenOwner) public view returns (uint balance)',
//     'function decimals() public view returns (uint decimals)',
//     'function allowance(address tokenOwner, address spender) public view returns (uint remaining)',
//     'function transfer(address to, uint tokens) public returns (bool success)',
//     'function approve(address spender, uint tokens) public returns (bool success)',
//     'function transferFrom(address from, address to, uint tokens) public returns (bool success)',
//     'function symbol() public view returns (string)',
//
//     'event Transfer(address indexed from, address indexed to, uint tokens)',
//     'event Approval(address indexed tokenOwner, address indexed spender, uint tokens)'
//   ];
//   const contract = new ethers.Contract(token.address, abi, provider);
//   const tx = await contract.approve(userAddress, amount);
//   console.log('TX IN APPROVe', tx);
//   const txHash = 'hello';
//   // if (waitForReceipt) {
//   //   const receipt = await txResponse.wait(1);
//   //   return receipt.transactionHash;
//   // }
//   return txHash;
// }

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
