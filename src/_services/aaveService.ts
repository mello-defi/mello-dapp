import {
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
import { decimalPlacesAreValid } from '_utils/index';
import { ComputedUserReserve } from '@aave/protocol-js/dist/v2/types';

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
  // (1 / 337741366207540) * (10 ** 18)
  return data.priceOracle.usdPriceEth;
}
export async function runAaveApprovalTransaction(
  txs: EthereumTransactionTypeExtended[],
  provider: ethers.providers.Web3Provider,
  waitForConfirmation = false
): Promise<string> {
  return runAaveTransactionType(txs, provider, eEthereumTxType.ERC20_APPROVAL, waitForConfirmation);
}

export const getMarketDataForSymbol = (
  marketDataResults: MarketDataResult[],
  symbol: string
): MarketDataResult | undefined => {
  return marketDataResults?.find(
    (m) => m.symbol === (symbol.startsWith('W') ? symbol.substring(1) : symbol).toLocaleLowerCase()
  );
};
export const getFiatValueForUserReserve = (
  marketDataResults: MarketDataResult[],
  reserveAmount: string,
  reserveSymbol: string
): string => {
  const symbol =
    reserveSymbol.toLowerCase() === CryptoCurrencySymbol.WMATIC.toLowerCase()
      ? CryptoCurrencySymbol.MATIC.toLowerCase()
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
  waitForConfirmation = false
): Promise<string> {
  return runAaveTransactionType(txs, provider, eEthereumTxType.DLP_ACTION, waitForConfirmation);
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
  waitForConfirmation = false
): Promise<string> {
  const tx = txs.find((tx: EthereumTransactionTypeExtended) => tx.txType === transactionType);
  console.log('tx', tx);
  let transactionHash = '';
  if (tx) {
    try {
      const txData = await tx.tx();
      transactionHash = await executeEthTransaction(txData, provider, waitForConfirmation);
    } catch (e: any) {
      console.log('runAaveTransactionType error', e);
      throw e;
    }
  }
  return transactionHash;
}

export function calculateNewHealthFactor(
  reserveData: ComputedReserveData,
  userSummaryData: UserSummaryData,
  amount: string
): string {
  // https://sourcegraph.com/github.com/aave/aave-ui/-/blob/src/libs/pool-data-provider/hooks/use-v2-protocol-data-with-rpc.tsx?L108
  const formattedUsdPriceEth = BigNumber.from(10)
    .pow(18 + 8)
    // @ts-ignore
    .div(reserveData.price.oracle.usdPriceEth.toString());
  try {
    // @ts-ignore
    // const amountToBorrowInUsd = valueToBigNumber(ethers.utils.parseUnits(amount, 10).toString())
    //   // @ts-ignore
    //   .multipliedBy(reserveData.price.oracle.usdPriceEth || '0')
    //   .multipliedBy(formattedUsdPriceEth.toString());
    //
    const amountToBorrowInUsd = valueToBigNumber(ethers.utils.parseUnits(amount, 10).toString())
      .multipliedBy(reserveData.price.priceInEth)
      .multipliedBy(ethers.utils.formatUnits(formattedUsdPriceEth, 18));

    return calculateHealthFactorFromBalancesBigUnits(
      userSummaryData.totalCollateralUSD,
      valueToBigNumber(userSummaryData.totalBorrowsUSD).plus(amountToBorrowInUsd),
      userSummaryData.currentLiquidationThreshold
    ).toFixed(2);
  } catch (e) {
    console.log(e);
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
  // lendingPool.
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
