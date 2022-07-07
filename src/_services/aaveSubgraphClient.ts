import { ReserveData, UserSummaryData, v2 } from '@aave/protocol-js';
import { createClient, gql } from 'urql';

export async function getEthPrice(): Promise<string> {
  const result = await client.readQuery(GET_ETH_PRICE);
  return result?.data.getEthPrice;
}
const client = createClient({
  // TODO- make network specific
  url: 'https://api.thegraph.com/subgraphs/name/aave/aave-v2-matic'
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
export async function getUserSummaryData(
  userAddress: string,
  reserves: ReserveData[]
): Promise<UserSummaryData> {
  const userReservesResults = await client.readQuery(GET_USER_RESERVES, {
    userAddress: userAddress.toLocaleLowerCase()
  });
  const ethPrice = await getEthPrice();
  const incentivesControllerResults = await client.readQuery(GET_INCENTIVES_CONTROLLER);
  return v2.formatUserSummaryData(
    reserves,
    userReservesResults?.data.userReserves,
    userAddress.toLocaleLowerCase(),
    ethPrice,
    Math.floor(Date.now() / 1000),
    incentivesControllerResults?.data.incentivesController
  );
}
export async function getReserves(): Promise<ReserveData[]> {
  const reserveResults = await client.readQuery(GET_RESERVES);
  return reserveResults?.data.reserves as ReserveData[];
}
