import {
  BigNumber as AaveBigNumber,
  calculateHealthFactorFromBalancesBigUnits,
  ComputedReserveData,
  eEthereumTxType,
  EthereumTransactionTypeExtended,
  InterestRate,
  Market,
  Network,
  ReserveData,
  TxBuilderV2,
  UserSummaryData,
  v2,
  valueToBigNumber
} from '@aave/protocol-js';
import { executeEthTransaction } from '_services/walletService';
import { BigNumber, ethers } from 'ethers';
import { ApolloClient, DefaultOptions, gql, InMemoryCache } from '@apollo/client';
import LendingPoolInterface from '@aave/protocol-js/dist/tx-builder/interfaces/v2/LendingPool';
import { CryptoCurrencySymbol } from '_enums/currency';
import { MarketDataResult } from '_services/marketDataService';
import { formatTokenValueInFiat } from '_services/priceService';
import { ComputedUserReserve } from '@aave/protocol-js/dist/v2/types';
import { HealthFactorImpact, HealthFactorResource } from '_enums/aave';

const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'ignore'
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all'
  }
};

const client = new ApolloClient({
  // REVIEW - make network specific
  uri: 'https://api.thegraph.com/subgraphs/name/aave/aave-v2-matic',
  cache: new InMemoryCache({ resultCaching: false }),
  defaultOptions
});

const GET_RESERVES = gql`
  query GetReserves {
    reserves(orderBy: totalDeposits, where: { usageAsCollateralEnabled: true }) {
      id
      underlyingAsset
      name
      symbol
      decimals
      isActive
      isFrozen
      usageAsCollateralEnabled
      borrowingEnabled
      stableBorrowRateEnabled
      baseLTVasCollateral
      optimalUtilisationRate
      averageStableRate
      stableRateSlope1
      stableRateSlope2
      baseVariableBorrowRate
      variableRateSlope1
      variableRateSlope2
      variableBorrowIndex
      variableBorrowRate
      totalScaledVariableDebt
      liquidityIndex
      reserveLiquidationThreshold
      aToken {
        id
      }
      vToken {
        id
      }
      sToken {
        id
      }
      availableLiquidity
      stableBorrowRate
      liquidityRate
      totalPrincipalStableDebt
      totalLiquidity
      utilizationRate
      reserveLiquidationBonus
      price {
        priceInEth
        oracle {
          usdPriceEth
        }
      }
      lastUpdateTimestamp
      stableDebtLastUpdateTimestamp
      reserveFactor
    }
  }
`;

const GET_USER_RESERVES = gql`
  query GetUserReserves($userAddress: String!) {
    userReserves(orderBy: id, where: { user: $userAddress }) {
      scaledATokenBalance
      reserve {
        id
        underlyingAsset
        name
        symbol
        decimals
        liquidityRate
        reserveLiquidationBonus
        lastUpdateTimestamp
        aToken {
          id
        }
      }
      usageAsCollateralEnabledOnUser
      stableBorrowRate
      stableBorrowLastUpdateTimestamp
      principalStableDebt
      scaledVariableDebt
      variableBorrowIndex
      lastUpdateTimestamp
    }
  }
`;

const GET_INCENTIVES_CONTROLLER = gql`
  query GetIncentivesController {
    incentivesController(id: "0x357d51124f59836ded84c8a1730d72b749d8bc23") {
      id
      rewardToken
      rewardTokenSymbol
      rewardTokenDecimals
      precision
      emissionEndTimestamp
    }
  }
`;
const GET_ETH_PRICE = gql`
  query GetEthPrice {
    priceOracle(id: "1") {
      usdPriceEth
    }
  }
`;

export async function getEthPrice(): Promise<string> {
  const { data } = await client.query({
    query: GET_ETH_PRICE
  });
  return data.priceOracle.usdPriceEth;
}
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
  let maxUserAmountToWithdraw = AaveBigNumber.min(
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
    maxUserAmountToWithdraw = AaveBigNumber.min(
      maxUserAmountToWithdraw,
      totalCollateralToWithdrawInETH.dividedBy(reserve.price.priceInEth)
    ).toString();
  }
  // console.log(AaveBigNumber.max(maxUserAmountToWithdraw, 0).toString());
  maxUserAmountToWithdraw = AaveBigNumber.max(maxUserAmountToWithdraw, 0).toString();
  maxUserAmountToWithdraw = (+maxUserAmountToWithdraw).toFixed(reserve.decimals).toString();
  return ethers.utils.parseUnits(maxUserAmountToWithdraw, reserve.decimals);
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
    const amountInUsd = valueToBigNumber(ethers.utils.parseUnits(amount, 10).toString())
      .multipliedBy(reserveData.price.priceInEth)
      .multipliedBy(ethers.utils.formatUnits(formattedUsdPriceEth, 18));

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

export async function getUserSummaryData(
  userAddress: string,
  reserves: ReserveData[]
): Promise<UserSummaryData> {
  const userReservesResults = await client.query({
    query: GET_USER_RESERVES,
    variables: { userAddress: userAddress.toLocaleLowerCase() }
  });
  const ethPrice = await getEthPrice();
  const incentivesControllerResults = await client.query({ query: GET_INCENTIVES_CONTROLLER });
  return v2.formatUserSummaryData(
    reserves,
    userReservesResults.data.userReserves,
    userAddress.toLocaleLowerCase(),
    ethPrice,
    Math.floor(Date.now() / 1000),
    incentivesControllerResults.data.incentivesController
  );
}
export async function getReserves(): Promise<ReserveData[]> {
  const reserveResults = await client.query({ query: GET_RESERVES });
  return reserveResults.data.reserves as ReserveData[];
}
