import React, { useEffect, useState } from 'react';
import PoweredByLink from '_components/core/PoweredByLink';
import aaveLogo from '_assets/images/logos/aave.svg';
import { HorizontalLineBreak } from '_components/core/HorizontalLineBreak';
import { TokenDefinition } from '_enums/tokens';
import WalletBalance from '_pages/wallet/WalletBalance';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { NavTab } from '_redux/types/uiTypes';
import { setActiveTab } from '_redux/effects/uiEffects';
import { ArrowForward, ArrowRight } from '@mui/icons-material';
import { ComputedUserReserve } from '@aave/protocol-js/dist/v2/types';
import ComputedUserReserveListItem from '_components/aave/ComputedUserReserveListItem';
import UserReservesSkeleton from '_components/aave/UserReservesSkeleton';
import useAaveUserSummary from '_hooks/useAaveUserSummary';
import useAaveReserves from '_hooks/useAaveReserves';
import { WalletTokenBalance, WalletTokenBalances } from '_redux/types/walletTypes';
import HealthFactorNumber from '_components/aave/HealthFactorNumber';
import useMarketPrices from '_hooks/useMarketPrices';
import { getMarketDataForSymbol } from '_services/aaveService';
import { ethers } from 'ethers';
import { CryptoCurrencySymbol } from '_enums/currency';
import { getTransactionCount } from '_services/walletService';
import { setStep } from '_redux/effects/onboardingEffects';
import { stepAddGasToWallet } from '_redux/reducers/onboardingReducer';

function DashboardLink({ text, navTab }: { text: string; navTab: NavTab }) {
  const dispatch = useDispatch();
  return (
    <div
      onClick={() => dispatch(setActiveTab(navTab))}
      className={'flex-row-center cursor-pointer hover:text-gray-400 transition'}
    >
      <span className={'text-body'}>{text}</span>
      <ArrowForward className={'ml-2'} />
    </div>
  );
}

export default function Dashboard() {
  const tokenSet = useSelector((state: AppState) => state.web3.tokenSet);
  const walletBalances = useSelector((state: AppState) => state.wallet.balances);
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const provider = useSelector((state: AppState) => state.web3.provider);
  // const aaveReserves = useAaveReserves()
  // ethers.providers.
  const userSummary = useAaveUserSummary();
  const marketPrices = useMarketPrices();
  const [totalAssets, setTotalAssets] = useState<number>(0);
  const [totalDebts, setTotalDebts] = useState<number>(0);
  const [healthFactor, setHealthFactor] = useState<string>('');

  useEffect(() => {
    if (
      userSummary &&
      walletBalances &&
      totalAssets === 0 &&
      Object.keys(walletBalances).length > 0
    ) {
      // console.log()
      let totalAaveDeposits = 0;
      let totalAaveDebts = 0;
      for (const reserve of userSummary.reservesData) {
        totalAaveDeposits += parseFloat(reserve.underlyingBalanceUSD);
        totalAaveDebts += parseFloat(reserve.totalBorrowsUSD);
      }
      let totalWalletBalances = 0;
      for (const tokenKey of Object.keys(walletBalances)) {
        const symbol = tokenKey as CryptoCurrencySymbol;
        const data = getMarketDataForSymbol(marketPrices, tokenKey);
        try {
          // REVIEW
          const balance =
            walletBalances[symbol] !== undefined && walletBalances[symbol]?.balance !== undefined
              ? walletBalances[symbol]?.balance.toString()
              : 0;
          const decimals = tokenSet[symbol]?.decimals || 0;
          if (data && balance && decimals) {
            totalWalletBalances +=
              parseFloat(ethers.utils.formatUnits(balance, decimals)) * data.current_price;
          }
        } catch (error: any) {
          console.log(error);
        }
      }
      setTotalAssets(totalAaveDeposits + totalWalletBalances);
      setTotalDebts(totalAaveDebts);
    }
    if (!healthFactor && userSummary) {
      setHealthFactor(parseFloat(userSummary.healthFactor).toFixed(2));
    }
  }, [userSummary, walletBalances]);
  // const totalAss

  return (
    <div>
      <div className={'flex-row-center justify-between'}>
        <span className={'text-header'}>Dashboard</span>
      </div>
      <HorizontalLineBreak />
      <div className={'flex-row-center justify-evenly flex-wrap'}>
        <div className={'bg-gray-100 w-1/2 md:w-1/4 rounded-2xl p-2'}>
          Net worth: <span className={'font-mono'}>${(totalAssets - totalDebts).toFixed(2)}</span>
        </div>
        <div className={'bg-gray-100 w-1/2 md:w-1/4 rounded-2xl p-2'}>
          Total assets: <span className={'font-mono'}>${totalAssets.toFixed(2)}</span>{' '}
        </div>
        <div className={'bg-gray-100 w-1/2 md:w-1/4 rounded-2xl p-2'}>
          Total debts: <span className={'font-mono'}>${totalDebts.toFixed(2)}</span>
        </div>
        <div className={'bg-gray-100 w-1/2 md:w-1/4 rounded-2xl p-2'}>
          Health factor{' '}
          <span className={'font-mono'}>
            <HealthFactorNumber healthFactor={healthFactor} />
          </span>
        </div>
      </div>
      <HorizontalLineBreak />
      <div>
        <DashboardLink text={'Wallet'} navTab={NavTab.WALLET} />
        {Object.values(tokenSet).map((token: TokenDefinition) => (
          <WalletBalance key={token.symbol} token={token} hideZeroBalance={true} />
        ))}
      </div>
      <HorizontalLineBreak />
      <div>
        <DashboardLink text={'Borrows'} navTab={NavTab.BORROW} />
        <div className={'mt-2'}>
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
      </div>
      <HorizontalLineBreak />
      <div>
        <DashboardLink text={'Deposits'} navTab={NavTab.DEPOSIT} />
        <div className={'mt-2'}>
          {/* REVIEW  (dupe) */}
          {userSummary && userSummary.reservesData ? (
            <div>
              {userSummary.reservesData
                .filter(
                  (reserve: ComputedUserReserve) =>
                    parseFloat(parseFloat(reserve.underlyingBalance).toFixed(6)) > 0
                )
                .sort(
                  (a, b) => parseFloat(b.underlyingBalanceETH) - parseFloat(a.underlyingBalanceETH)
                )
                .map((reserve: ComputedUserReserve) => {
                  return (
                    <ComputedUserReserveListItem
                      key={reserve.reserve.symbol}
                      reserveName={reserve.reserve.name}
                      reserveSymbol={reserve.reserve.symbol}
                      reserveAddress={reserve.reserve.underlyingAsset}
                      reserveAmount={reserve.underlyingBalance}
                    />
                  );
                })}
            </div>
          ) : (
            <UserReservesSkeleton />
          )}
        </div>
      </div>
    </div>
  );
}
