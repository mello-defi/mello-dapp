import PoweredByLink from '_components/core/PoweredByLink';
import aaveLogo from '_assets/images/logos/aave.svg';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { getMarketDataForSymbol } from '_services/aaveService';
import { ComputedReserveData } from '@aave/protocol-js';
import { ComputedUserReserve } from '@aave/protocol-js/dist/v2/types';
import ComputedUserReserveListItem from '_components/aave/ComputedUserReserveListItem';
import AaveReserve from '_components/aave/AaveReserve';
import { convertCryptoAmounts, formatTokenValueInFiat } from '_services/priceService';
import { CryptoCurrencySymbol } from '_enums/currency';
import useMarketPrices from '_hooks/useMarketPrices';
import { findTokenByAddress } from '_enums/tokens';
import { AaveSection } from '_enums/aave';
import CurrentHealthFactor from '_components/aave/CurrentHealthFactor';
import UserReservesSkeleton from '_components/aave/UserReservesSkeleton';
import AaveReservesSkeleton from '_components/aave/AaveReservesSkeleton';
import useAaveUserSummary from '_hooks/useAaveUserSummary';
import useAaveReserves from '_hooks/useAaveReserves';

export default function Borrow() {
  const provider = useSelector((state: AppState) => state.web3.provider);
  const tokenSet = useSelector((state: AppState) => state.web3.tokenSet);
  const marketPrices = useMarketPrices();
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const userSummary = useAaveUserSummary();
  const aaveReserves = useAaveReserves();
  const [ethPrice, setEthPrice] = React.useState<number | undefined>(undefined);
  console.log('\nBorrow.tsx: market prices', marketPrices);

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

  console.log(
    'userSummary && userSummary.reservesData',
    userSummary && userSummary.reservesData ? 'true' : 'false'
  );
  return (
    <div className={'space-y-2'}>
      <div className={'flex-row-center justify-between'}>
        <span className={'text-header'}>My borrows</span>
        <PoweredByLink url={'https://aave.com/'} logo={aaveLogo} />
      </div>
      <div>
        {userSummary && userSummary.reservesData ? (
          userSummary.reservesData
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
            })
        ) : (
          <UserReservesSkeleton />
        )}
      </div>
      <span className={'text-body flex-row-center justify-between'}>
        <span>Available to borrow</span>
        <span className={'font-mono'}>
          {userSummary &&
            ethPrice &&
            formatTokenValueInFiat(ethPrice, userSummary?.availableBorrowsETH)}
        </span>
      </span>
      {userSummary && <CurrentHealthFactor healthFactor={userSummary.healthFactor} />}
      <div>
        {userSummary && marketPrices && marketPrices.length > 0 ? (
          aaveReserves?.map((reserve: ComputedReserveData) => {
            return (
              <AaveReserve
                token={findTokenByAddress(tokenSet, reserve.underlyingAsset)}
                aaveSection={AaveSection.Borrow}
                key={reserve.symbol}
                userSummaryData={userSummary}
                reserve={reserve}
                maxBorrowAmount={convertCryptoAmounts(
                  userSummary.availableBorrowsETH,
                  getMarketDataForSymbol(marketPrices, CryptoCurrencySymbol.ETH).current_price,
                  getMarketDataForSymbol(marketPrices, reserve.symbol).current_price
                ).toFixed(6)}
                userReserve={userSummary.reservesData.find(
                  (r) => r.reserve.symbol === reserve.symbol
                )}
              />
            );
          })
        ) : (
          <AaveReservesSkeleton />
        )}
      </div>
    </div>
  );
}
