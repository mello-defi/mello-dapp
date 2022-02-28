import {
  ComputedReserveData,
  eEthereumTxType,
  EthereumTransactionTypeExtended,
  InterestRate,
  Market,
  Network,
  ReserveData,
  TxBuilderV2,
  UserSummaryData,
  v2
} from '@aave/protocol-js';
import { executeEthTransaction } from '_services/walletService';
import { ethers } from 'ethers';
import { ApolloClient, gql, InMemoryCache } from '@apollo/client';
import { validPolygonTokenSymbolsUppercase } from '_enums/tokens';
import LendingPoolInterface from '@aave/protocol-js/dist/tx-builder/interfaces/v2/LendingPool';
import { CryptoCurrencySymbol } from '_enums/currency';
import { MarketDataResult } from '_services/marketDataService';
import { formatTokenValueInFiat } from '_services/priceService';

const client = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/aave/aave-v2-matic',
  cache: new InMemoryCache()
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
): MarketDataResult => {
  const marketData: MarketDataResult | undefined = marketDataResults?.find(
    (m) => m.symbol === (symbol.startsWith('W') ? symbol.substring(1) : symbol).toLocaleLowerCase()
  );
  if (marketData) {
    return marketData;
  }
  throw new Error('No market data found for ' + symbol);
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
      console.log('transactionHash', transactionHash);
    } catch (e: any) {
      console.log('error', e);
    }
  }
  return transactionHash;
}

export async function getUserReserves(userAddress: string): Promise<UserSummaryData> {
  const userReservesResults = await client.query({
    query: GET_USER_RESERVES,
    variables: { userAddress: userAddress.toLocaleLowerCase() }
  });
  const reserves = await client.query({ query: GET_RESERVES });
  // console.log('RAW USER RESEVES', userReservesResults.data.userReserves);
  const incentivesControllerResults = await client.query({ query: GET_INCENTIVES_CONTROLLER });
  return v2.formatUserSummaryData(
    reserves.data.reserves,
    userReservesResults.data.userReserves,
    userAddress.toLocaleLowerCase(),
    ((1 / 2950.59) * 10) ^ 18,
    Math.floor(Date.now() / 1000),
    incentivesControllerResults.data.incentivesController
  );
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
  amount: number
): Promise<EthereumTransactionTypeExtended[]> {
  const lendingPool = getLendingPool(provider);
  console.log(`Depositing ${amount} ${reserveTokenAddress} to ${userAddress}`);
  // lendingPool.
  return lendingPool.deposit({
    user: userAddress.toLocaleLowerCase(),
    reserve: reserveTokenAddress,
    amount: amount.toString()
  });
}

export async function getWithdrawTransactions(
  provider: ethers.providers.Web3Provider,
  userAddress: string,
  reserveTokenAddress: string,
  amount: number
): Promise<EthereumTransactionTypeExtended[]> {
  const lendingPool = getLendingPool(provider);
  console.log(`Withdrawing ${amount} ${reserveTokenAddress} to ${userAddress}`);
  return lendingPool.withdraw({
    user: userAddress.toLocaleLowerCase(),
    reserve: reserveTokenAddress,
    amount: amount.toString()
  });
}

export async function getBorrowTransactions(
  provider: ethers.providers.Web3Provider,
  userAddress: string,
  reserveTokenAddress: string,
  amount: number
): Promise<EthereumTransactionTypeExtended[]> {
  const lendingPool = getLendingPool(provider);
  console.log(`Borrowing ${amount} ${reserveTokenAddress} to ${userAddress}`);
  return lendingPool.borrow({
    user: userAddress.toLocaleLowerCase(),
    reserve: reserveTokenAddress,
    amount: amount.toString(),
    interestRateMode: InterestRate.Variable
  });
}

export async function getRepayTransactions(
  provider: ethers.providers.Web3Provider,
  userAddress: string,
  reserveTokenAddress: string,
  amount: number
): Promise<EthereumTransactionTypeExtended[]> {
  const lendingPool = getLendingPool(provider);
  console.log(`Repaying ${amount} ${reserveTokenAddress} to ${userAddress}`);
  return lendingPool.repay({
    user: userAddress.toLocaleLowerCase(),
    reserve: reserveTokenAddress,
    amount: amount.toString(),
    interestRateMode: InterestRate.Variable
  });
}

// export async function borrow(
//   provider: ethers.providers.Web3Provider,
//   userAddress: string,
//   reserveTokenAddress: string,
//   amount: number
// ): Promise<string> {
//   const lendingPool = getLendingPool(provider);
//   const txs: EthereumTransactionTypeExtended[] = await lendingPool.borrow({
//     user: userAddress.toLocaleLowerCase(),
//     reserve: reserveTokenAddress,
//     amount: amount.toString(),
//     interestRateMode: InterestRate.Variable
//   });
//   return runAaveTransaction(txs, provider, true);
// }
//
// export async function repay(
//   provider: ethers.providers.Web3Provider,
//   userAddress: string,
//   reserveTokenAddress: string,
//   amount: number
// ): Promise<string> {
//   const lendingPool = getLendingPool(provider);
//   const txs: EthereumTransactionTypeExtended[] = await lendingPool.repay({
//     user: userAddress.toLocaleLowerCase(),
//     reserve: reserveTokenAddress,
//     amount: amount.toString(),
//     interestRateMode: InterestRate.Variable
//   });
//   return runAaveTransaction(txs, provider, true);
// }

export async function getReserves(): Promise<ComputedReserveData[]> {
  const reserveResults = await client.query({ query: GET_RESERVES });
  const reserves: ReserveData[] = reserveResults.data.reserves;
  const computed: ComputedReserveData[] = v2.formatReserves(
    reserves.filter((r: ReserveData) =>
      validPolygonTokenSymbolsUppercase.includes(r.symbol.toUpperCase())
    )
  );
  // computed.map((r: ComputedReserveData) => {
  //   let formattedName = '';
  //   switch (r.symbol) {
  //     case 'WBTC':
  //       formattedName = 'Bitcoin';
  //       break;
  //     case 'USDC':
  //       formattedName = 'USD Coin';
  //       break;
  //     case 'DAI':
  //       formattedName = 'DAI Stablecoin';
  //       break;
  //     case 'WETH':
  //       formattedName = 'Ethereum';
  //       break;
  //     case 'WMATIC':
  //       formattedName = 'MATIC';
  //       break;
  //     default:
  //       formattedName = r.name;
  //   }
  //   r.name = formattedName;
  //   return r;
  // })
  return computed;
}
