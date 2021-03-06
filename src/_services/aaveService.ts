import {
  BigNumber as AdvancedBigNumber,
  calculateHealthFactorFromBalancesBigUnits,
  ComputedReserveData,
  eEthereumTxType,
  EthereumTransactionTypeExtended,
  InterestRate,
  Market,
  Network,
  TxBuilderV2,
  UserSummaryData,
  valueToBigNumber
} from '@aave/protocol-js';
import { executeEthTransaction } from '_services/walletService';
import { BigNumber, ethers } from 'ethers';
import LendingPoolInterface from '@aave/protocol-js/dist/tx-builder/interfaces/v2/LendingPool';
import { CryptoCurrencySymbol } from '_enums/currency';
import { MarketDataResult } from '_services/marketDataService';
import { formatTokenValueInFiat } from '_services/priceService';
import { ComputedUserReserve } from '@aave/protocol-js/dist/v2/types';
import { HealthFactorImpact, HealthFactorResource } from '_enums/aave';
import { formatUnits, parseUnits } from 'ethers/lib/utils';

export async function runAaveApprovalTransaction(
  txs: EthereumTransactionTypeExtended[],
  provider: ethers.providers.Web3Provider,
  gasPrice: BigNumber | undefined
): Promise<string> {
  return runAaveTransactionType(txs, provider, eEthereumTxType.ERC20_APPROVAL, gasPrice);
}

export const getFiatValueForUserReserve = (
  marketDataResults: MarketDataResult[],
  reserveAmount: string,
  reserveSymbol: string
): string => {
  const symbol =
    reserveSymbol.toLowerCase() === CryptoCurrencySymbol.WMATIC.toLowerCase()
      ? CryptoCurrencySymbol.MATIC.toLowerCase()
      : reserveSymbol.toLowerCase() === CryptoCurrencySymbol.WETH.toLowerCase()
      ? CryptoCurrencySymbol.ETH.toLowerCase()
      : reserveSymbol.toLowerCase();
  const data = marketDataResults.find(
    (m: MarketDataResult) => m.symbol.toLocaleLowerCase() === symbol
  );
  if (data) {
    return formatTokenValueInFiat(data.current_price, reserveAmount);
  }
  return '';
};

export async function runAaveActionTransaction(
  txs: EthereumTransactionTypeExtended[],
  provider: ethers.providers.Web3Provider,
  gasPrice: BigNumber | undefined
): Promise<string> {
  return runAaveTransactionType(txs, provider, eEthereumTxType.DLP_ACTION, gasPrice);
}

export type ComputedUserReserveProperty = 'underlyingBalanceUSD' | 'totalBorrowsUSD';

export function sortUserReservesByKey(
  aaveReserves: ComputedReserveData[],
  userReserves: ComputedUserReserve[],
  key: ComputedUserReserveProperty
): ComputedReserveData[] {
  return aaveReserves.sort((a, b) => {
    const userReserveA = userReserves.find(
      (r: ComputedUserReserve) => r.reserve.symbol === a.symbol
    );
    const userReserveB = userReserves.find(
      (r: ComputedUserReserve) => r.reserve.symbol === b.symbol
    );
    const totalA = userReserveA ? userReserveA[key] : '0';
    const totalB = userReserveB ? userReserveB[key] : '0';
    return parseFloat(totalB) - parseFloat(totalA);
  });
}

async function runAaveTransactionType(
  txs: EthereumTransactionTypeExtended[],
  provider: ethers.providers.Web3Provider,
  transactionType: eEthereumTxType,
  gasPrice: BigNumber | undefined
): Promise<string> {
  const tx = txs.find((tx: EthereumTransactionTypeExtended) => tx.txType === transactionType);
  let transactionHash = '';
  if (tx) {
    try {
      const txData = await tx.tx();
      const transactionResponse = await executeEthTransaction(txData, provider, gasPrice);
      transactionHash = transactionResponse.hash;
    } catch (e: any) {
      console.log('runAaveTransactionType error', e);
      throw e;
    }
  }
  return transactionHash;
}

export function calculateMaxWithdrawAmount(
  userSummmary: UserSummaryData,
  userReserve: ComputedUserReserve,
  reserve: ComputedReserveData
): BigNumber {
  // lifted directly from
  // https://sourcegraph.com/github.com/aave/aave-ui/-/blob/src/modules/withdraw/screens/WithdrawAmount/index.tsx?L40
  let maxUserAmountToWithdraw = AdvancedBigNumber.min(
    userReserve.underlyingBalance,
    reserve.availableLiquidity
  ).toString(10);

  if (
    userReserve.usageAsCollateralEnabledOnUser &&
    reserve.usageAsCollateralEnabled &&
    userSummmary.totalBorrowsETH !== '0'
  ) {
    // if we have any borrowings we should check how much we can withdraw without liquidation
    // with 0.5% gap to avoid reverting of tx
    let totalCollateralToWithdrawInETH = valueToBigNumber('0');
    const excessHF = valueToBigNumber(userSummmary.healthFactor).minus('1');
    if (excessHF.gt('0')) {
      totalCollateralToWithdrawInETH = excessHF
        .multipliedBy(userSummmary.totalBorrowsETH)
        // because of the rounding issue on the contracts side this value still can be incorrect
        .div(Number(reserve.reserveLiquidationThreshold) + 0.01)
        .multipliedBy('0.99');
    }
    maxUserAmountToWithdraw = AdvancedBigNumber.min(
      maxUserAmountToWithdraw,
      totalCollateralToWithdrawInETH.dividedBy(reserve.price.priceInEth)
    ).toString();
  }
  // console.log(AdvancedBigNumber.max(maxUserAmountToWithdraw, 0).toString());
  maxUserAmountToWithdraw = AdvancedBigNumber.max(maxUserAmountToWithdraw, 0).toString();
  maxUserAmountToWithdraw = (+maxUserAmountToWithdraw).toFixed(reserve.decimals).toString();
  return parseUnits(maxUserAmountToWithdraw, reserve.decimals);
}

export function calculateNewHealthFactor(
  reserveData: ComputedReserveData,
  userSummaryData: UserSummaryData,
  amount: string,
  healthFactorImpact: HealthFactorImpact,
  healthFactorResource: HealthFactorResource
): string {
  // https://sourcegraph.com/github.com/aave/aave-ui/-/blob/src/libs/pool-data-provider/hooks/use-v2-protocol-data-with-rpc.tsx?L108
  const formattedUsdPriceEth = BigNumber.from(10)
    .pow(18 + 8)
    // @ts-ignore
    .div(reserveData.price.oracle.usdPriceEth.toString());
  try {
    amount = (+amount).toFixed(10).toString();
    const amountInUsd = valueToBigNumber(parseUnits(amount, 10).toString())
      .multipliedBy(reserveData.price.priceInEth)
      .multipliedBy(formatUnits(formattedUsdPriceEth, 18));

    if (healthFactorResource === HealthFactorResource.Borrows) {
      const newBorrowBalance =
        healthFactorImpact === HealthFactorImpact.Increase
          ? valueToBigNumber(userSummaryData.totalBorrowsUSD).minus(amountInUsd)
          : valueToBigNumber(userSummaryData.totalBorrowsUSD).plus(amountInUsd);
      return calculateHealthFactorFromBalancesBigUnits(
        userSummaryData.totalCollateralUSD,
        newBorrowBalance,
        userSummaryData.currentLiquidationThreshold
      ).toFixed(2);
    } else {
      const newCollateralBalance =
        healthFactorImpact === HealthFactorImpact.Increase
          ? valueToBigNumber(userSummaryData.totalCollateralUSD).plus(amountInUsd)
          : valueToBigNumber(userSummaryData.totalCollateralUSD).minus(amountInUsd);
      return calculateHealthFactorFromBalancesBigUnits(
        newCollateralBalance,
        userSummaryData.totalBorrowsUSD,
        userSummaryData.currentLiquidationThreshold
      ).toFixed(2);
    }
  } catch (e) {
    console.error(e);
  }
  return '';
}

function getLendingPool(
  provider: ethers.providers.Web3Provider,
  network: Network = Network.polygon
): LendingPoolInterface {
  const txBuilder = new TxBuilderV2(network, provider);
  return txBuilder.getLendingPool(Market.Proto);
}

export async function getDepositTransactions(
  provider: ethers.providers.Web3Provider,
  userAddress: string,
  reserveTokenAddress: string,
  amount: string
): Promise<EthereumTransactionTypeExtended[]> {
  const lendingPool = getLendingPool(provider);
  console.log(`Depositing ${amount} ${reserveTokenAddress} to ${userAddress}`);
  return lendingPool.deposit({
    user: userAddress.toLocaleLowerCase(),
    reserve: reserveTokenAddress,
    amount
  });
}

export async function getWithdrawTransactions(
  provider: ethers.providers.Web3Provider,
  userAddress: string,
  reserveTokenAddress: string,
  amount: string
): Promise<EthereumTransactionTypeExtended[]> {
  const lendingPool = getLendingPool(provider);
  console.log(`Withdrawing ${amount} ${reserveTokenAddress} to ${userAddress}`);
  return lendingPool.withdraw({
    user: userAddress.toLocaleLowerCase(),
    reserve: reserveTokenAddress,
    amount
  });
}

export async function getBorrowTransactions(
  provider: ethers.providers.Web3Provider,
  userAddress: string,
  reserveTokenAddress: string,
  amount: string
): Promise<EthereumTransactionTypeExtended[]> {
  const lendingPool = getLendingPool(provider);
  console.log(`Borrowing ${amount} ${reserveTokenAddress} to ${userAddress}`);
  return lendingPool.borrow({
    user: userAddress.toLocaleLowerCase(),
    reserve: reserveTokenAddress,
    amount,
    interestRateMode: InterestRate.Variable
  });
}

export async function getRepayTransactions(
  provider: ethers.providers.Web3Provider,
  userAddress: string,
  reserveTokenAddress: string,
  amount: string
): Promise<EthereumTransactionTypeExtended[]> {
  const lendingPool = getLendingPool(provider);
  console.log(`Repaying ${amount} ${reserveTokenAddress} to ${userAddress}`);
  return lendingPool.repay({
    user: userAddress.toLocaleLowerCase(),
    reserve: reserveTokenAddress,
    amount,
    interestRateMode: InterestRate.Variable
  });
}
