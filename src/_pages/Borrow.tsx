import PoweredByLink from '_components/core/PoweredByLink';
import aaveLogo from '_assets/images/logos/aave.svg';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { getMarketDataForSymbol, getReserves, getUserReserves } from '_services/aaveService';
import { ComputedReserveData, UserSummaryData } from '@aave/protocol-js';
import { ComputedUserReserve } from '@aave/protocol-js/dist/v2/types';
import ComputedUserReserveListItem from '_components/aave/ComputedUserReserveListItem';
import AaveReserve from '_components/aave/AaveReserve';
import { convertCryptoAmounts, formatTokenValueInFiat } from '_services/priceService';
import { CryptoCurrencySymbol } from '_enums/currency';
import useMarketPrices from '_hooks/useMarketPrices';
import { findTokenByAddress } from '_enums/tokens';
import { AaveSection } from '_enums/aave';
import CurrentHealthFactor from '_components/aave/CurrentHealthFactor';

export default function Borrow() {
  const provider = useSelector((state: AppState) => state.web3.provider);
  const tokenSet = useSelector((state: AppState) => state.web3.tokenSet);
  const marketPrices = useMarketPrices();
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const [computedReserves, setComputedReserves] = useState<ComputedReserveData[] | undefined>(
    undefined
  );
  const [userSummaryData, setUserSummaryData] = useState<UserSummaryData | undefined>(undefined);
  const [ethPrice, setEthPrice] = React.useState<number | undefined>(undefined);
  console.log('\nBorrow.tsx: market prices', marketPrices);
  useEffect(() => {
    if (provider && userAddress && (!userSummaryData || !computedReserves)) {
      console.log(
        'Borrow.tsx: useEffect: provider, userAddress, userSummaryData, computedReserves'
      );
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
  }, [provider, userAddress, userSummaryData, computedReserves]);

  useEffect(() => {
    if (marketPrices && marketPrices.length > 0 && !ethPrice) {
      const ethPrice = marketPrices.find(
        (item) => item.symbol.toLowerCase() === CryptoCurrencySymbol.ETH.toLowerCase()
      );
      if (ethPrice) {
        setEthPrice(ethPrice.current_price);
      }
    }
  }, [marketPrices]);

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
              parseFloat(b.totalBorrowsETH) - parseFloat(a.totalBorrowsETH)
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
      {userSummaryData && <CurrentHealthFactor healthFactor={userSummaryData.healthFactor} />}
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
                userSummaryData={userSummaryData}
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
