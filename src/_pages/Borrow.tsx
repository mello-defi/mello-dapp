import PoweredByLink from '_components/core/PoweredByLink';
import aaveLogo from '_assets/images/logos/aave.svg';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { getMarketDataForSymbol, sortUserReservesByKey } from '_services/aaveService';
import { ComputedReserveData } from '@aave/protocol-js';
import { ComputedUserReserve } from '@aave/protocol-js/dist/v2/types';
import ComputedUserReserveListItem from '_components/aave/ComputedUserReserveListItem';
import AaveReserve from '_components/aave/AaveReserve';
import { convertCryptoAmounts, formatTokenValueInFiat } from '_services/priceService';
import { CryptoCurrencySymbol } from '_enums/currency';
import useMarketPrices from '_hooks/useMarketPrices';
import { AaveSection } from '_enums/aave';
import CurrentHealthFactor from '_components/aave/CurrentHealthFactor';
import UserReservesSkeleton from '_components/aave/UserReservesSkeleton';
import AaveReservesSkeleton from '_components/aave/AaveReservesSkeleton';
import useAaveUserSummary from '_hooks/useAaveUserSummary';
import useAaveReserves from '_hooks/useAaveReserves';
import { findTokenByAddress } from '_utils/index';
import { setStep } from '_redux/effects/onboardingEffects';
import { stepBorrowAave, stepDepositAave } from '_redux/reducers/onboardingReducer';

export default function Borrow() {
  const provider = useSelector((state: AppState) => state.web3.provider);
  const tokenSet = useSelector((state: AppState) => state.web3.tokenSet);
  const marketPrices = useMarketPrices();
  // const useWalletBalance =
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const userSummary = useAaveUserSummary();
  const aaveReserves = useAaveReserves();
  const [ethPrice, setEthPrice] = useState<number | undefined>(undefined);
  // const [maxBorrowAmount, setMaxBorrowAmount] = useState<string | undefined>(undefined);
  console.log('\nBorrow.tsx: market prices', marketPrices);
  console.log('\nBorrow.tsx: userSummary', userSummary);

  const dispatch = useDispatch();

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
        {/* REVIEW  (dupe) */}
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
        {userSummary && marketPrices && marketPrices.length > 0 && aaveReserves ? (
          sortUserReservesByKey(aaveReserves, userSummary.reservesData, 'totalBorrowsUSD').map(
            (reserve: ComputedReserveData) => {
              return (
                <AaveReserve
                  aaveSection={AaveSection.Borrow}
                  key={reserve.symbol}
                  reserveSymbol={reserve.symbol}
                />
              );
            }
          )
        ) : (
          <AaveReservesSkeleton />
        )}
      </div>
    </div>
  );
}
