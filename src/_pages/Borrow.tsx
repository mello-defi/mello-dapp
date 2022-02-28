import PoweredByLink from '_components/core/PoweredByLink';
import aaveLogo from '_assets/images/logos/aave.svg';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { getMarketDataForSymbol, getReserves, getUserReserves } from '_services/aaveService';
import {
  BigNumber,
  calculateHealthFactorFromBalancesBigUnits,
  ComputedReserveData,
  UserSummaryData
} from '@aave/protocol-js';
import { ComputedUserReserve } from '@aave/protocol-js/dist/v2/types';
import ComputedUserReserveListItem from '_components/aave/ComputedUserReserveListItem';
import AaveReserve from '_components/aave/AaveReserve';
import { convertCryptoAmounts, formatTokenValueInFiat } from '_services/priceService';
import { CryptoCurrencySymbol } from '_enums/currency';
import useMarketPrices from '_hooks/useMarketPrices';
import { findTokenByAddress } from '_enums/tokens';
import { AaveSection } from '_enums/aave';
import HealthFactor from '_components/aave/HealthFactor';

export default function Borrow() {
  const provider = useSelector((state: AppState) => state.web3.provider);
  const tokenSet = useSelector((state: AppState) => state.web3.tokenSet);
  const marketPrices = useMarketPrices();
  const userAddress = useSelector((state: AppState) => state.web3.userAddress);
  const [computedReserves, setComputedReserves] = useState<ComputedReserveData[] | undefined>(
    undefined
  );
  const [userSummaryData, setUserSummaryData] = useState<UserSummaryData | undefined>(undefined);
  const [ethPrice, setEthPrice] = React.useState<number | undefined>(undefined);
  useEffect(() => {
    if (provider && userAddress) {
      if (!userSummaryData) {
        getUserReserves(userAddress).then((data: UserSummaryData) => {
          setUserSummaryData(data);
        });
      }

      if (!computedReserves) {
        getReserves().then((reserves: ComputedReserveData[]) => {
          setComputedReserves(reserves);
        });
      }
    }
  });

  useEffect(() => {
    if (marketPrices) {
      const ethPrice = marketPrices.find(
        (item) => item.symbol.toLowerCase() === CryptoCurrencySymbol.ETH.toLowerCase()
      );
      if (ethPrice) {
        setEthPrice(ethPrice.current_price);
      }
    }
  }, [marketPrices]);
  const amount = -0.05;
  if (userSummaryData && computedReserves) {
    // https://sourcegraph.com/github.com/MyEtherWallet/MyEtherWallet/-/blob/src/dapps/aave-dapp/components/AaveSummary.vue?L224:28
    const selectedToken = computedReserves.find(
      (reserve) => reserve.symbol.toUpperCase() === 'USDC'
    );
    let nextHealthFactor = userSummaryData.healthFactor;
    let collateralBalanceETH: string | BigNumber = userSummaryData.totalCollateralETH;
    const totalBorrowsETH = userSummaryData.totalBorrowsETH;
    // console.log('totalBorrowsETH', totalBorrowsETH);
    if (selectedToken?.price) {
      const ethBalance = new BigNumber(amount).times(selectedToken?.price?.priceInEth);
      // console.log('ETHBAAL', ethBalance);
      collateralBalanceETH = new BigNumber(userSummaryData.totalCollateralETH).plus(ethBalance);
      // console.log('COLLATERAL BALANCE', collateralBalanceETH);
      nextHealthFactor = calculateHealthFactorFromBalancesBigUnits(
        collateralBalanceETH,
        totalBorrowsETH,
        // userSummaryData.totalFeesETH,
        userSummaryData.currentLiquidationThreshold
      ).toFixed(3);
    }
    // console.log('NEW HEALTH FACTOr')
    // console.log(nextHealthFactor);
  }

  return (
    <div className={'space-y-2'}>
      <div className={'flex-row-center justify-between'}>
        <span className={'text-title'}>My borrows</span>
        <PoweredByLink url={'https://aave.com/'} logo={aaveLogo} />
      </div>
      <div>
        {userSummaryData?.reservesData
          .filter(
            (reserve: ComputedUserReserve) =>
              parseFloat(parseFloat(reserve.totalBorrows).toFixed(6)) > 0
          )
          .sort(
            (a: ComputedUserReserve, b: ComputedUserReserve) =>
              parseFloat(b.totalBorrows) - parseFloat(a.totalBorrows)
          )
          .map((reserve: ComputedUserReserve) => {
            return (
              <ComputedUserReserveListItem
                key={reserve.reserve.symbol}
                reserveName={reserve.reserve.name}
                reserveSymbol={reserve.reserve.symbol}
                reserveAddress={reserve.reserve.underlyingAsset}
                reserveAmount={reserve.totalBorrows}
              />
            );
          })}
      </div>
      <span className={'text-title flex-row-center justify-between'}>
        <span>Available to borrow</span>
        <span>
          {userSummaryData &&
            ethPrice &&
            formatTokenValueInFiat(ethPrice, userSummaryData?.availableBorrowsETH)}
        </span>
      </span>
      {userSummaryData && <HealthFactor healthFactor={userSummaryData.healthFactor} />}
      <div>
        {userSummaryData &&
          marketPrices &&
          marketPrices.length > 0 &&
          computedReserves?.map((reserve: ComputedReserveData) => {
            return (
              <AaveReserve
                token={findTokenByAddress(tokenSet, reserve.underlyingAsset)}
                aaveSection={AaveSection.Borrow}
                key={reserve.symbol}
                reserve={reserve}
                maxBorrowAmount={convertCryptoAmounts(
                  userSummaryData.availableBorrowsETH,
                  getMarketDataForSymbol(marketPrices, CryptoCurrencySymbol.ETH).current_price,
                  getMarketDataForSymbol(marketPrices, reserve.symbol).current_price
                ).toFixed(6)}
                userReserve={userSummaryData.reservesData.find(
                  (r) => r.reserve.symbol === reserve.symbol
                )}
              />
            );
          })}
      </div>
    </div>
  );
}
