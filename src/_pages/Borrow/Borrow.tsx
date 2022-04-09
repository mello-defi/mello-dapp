import PoweredByLink from '_components/core/PoweredByLink';
import aaveLogo from '_assets/images/logos/services/aave.svg';
import React, { useEffect, useState } from 'react';
import { sortUserReservesByKey } from '_services/aaveService';
import { ComputedReserveData } from '@aave/protocol-js';
import AaveReserveRow from '_components/aave/AaveReserveRow';
import { formatTokenValueInFiat } from '_services/priceService';
import { CryptoCurrencySymbol } from '_enums/currency';
import useMarketPrices from '_hooks/useMarketPrices';
import { AaveSection } from '_enums/aave';
import CurrentHealthFactor from '_components/aave/CurrentHealthFactor';
import AaveReservesSkeleton from '_components/aave/AaveReservesSkeleton';
import useAaveUserSummary from '_hooks/useAaveUserSummary';
import useAaveReserves from '_hooks/useAaveReserves';
import UserBorrowSummary from '_pages/Borrow/UserBorrowSummary';
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';

export default function Borrow() {
  const tokenSet = useSelector((state: AppState) => state.web3.tokenSet);
  const marketPrices = useMarketPrices();
  const userSummary = useAaveUserSummary();
  const aaveReserves = useAaveReserves();
  const [ethPrice, setEthPrice] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (marketPrices && !ethPrice) {
      // const ethPrice = marketPrices.find(
      //   (item) => item.symbol.toLowerCase() === CryptoCurrencySymbol.ETH.toLowerCase()
      // );
      const ethAddress = tokenSet[CryptoCurrencySymbol.WETH]?.address;
      if (ethAddress) {
        const ethPrice = marketPrices[ethAddress.toLowerCase()];
        if (ethPrice) {
          setEthPrice(ethPrice);
        }
      }
    }
  }, [marketPrices]);
  return (
    <div className={'space-y-2'}>
      <div className={'flex-row-center justify-between'}>
        <span className={'text-header'}>Borrowed</span>
        <PoweredByLink url={'https://aave.com/'} logo={aaveLogo} />
      </div>
      <div>
        <UserBorrowSummary />
      </div>
      <span className={'text-body flex-row-center justify-between'}>
        <span>Available to borrow</span>
        <span className={'font-mono'}>
          {userSummary &&
            ethPrice &&
            formatTokenValueInFiat(ethPrice, userSummary?.availableBorrowsETH)}
        </span>
      </span>
      <CurrentHealthFactor healthFactor={userSummary?.healthFactor} />
      <div>
        {userSummary && aaveReserves ? (
          sortUserReservesByKey(aaveReserves, userSummary.reservesData, 'totalBorrowsUSD').map(
            (reserve: ComputedReserveData) => {
              return (
                <AaveReserveRow
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
