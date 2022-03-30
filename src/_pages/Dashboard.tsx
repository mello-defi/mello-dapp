import React, { useEffect, useState } from 'react';
import { HorizontalLineBreak } from '_components/core/HorizontalLineBreak';
import { EvmTokenDefinition } from '_enums/tokens';
import WalletBalance from '_pages/Wallet/WalletBalance';
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { NavTab } from '_redux/types/uiTypes';
import useAaveUserSummary from '_hooks/useAaveUserSummary';
import HealthFactorNumber from '_components/aave/HealthFactorNumber';
import useMarketPrices from '_hooks/useMarketPrices';
import { ethers } from 'ethers';
import { CryptoCurrencySymbol } from '_enums/currency';
import UserBorrowSummary from '_pages/Borrow/UserBorrowSummary';
import UserDepositSummary from '_pages/Deposit/UserDepositSummary';
import { getMarketDataForSymbol } from '_services/marketDataService';
import UserPools from '_components/balancer/UserPools';
import { formatUnits } from 'ethers/lib/utils';

function DashboardLink({ text, navTab }: { text: string; navTab: NavTab }) {
  return (
    <div className={'flex-row-center hover:text-gray-400'}>
      <span className={'text-body'}>{text}</span>
    </div>
  );
}

export default function Dashboard() {
  const tokenSet = useSelector((state: AppState) => state.web3.tokenSet);
  const walletBalances = useSelector((state: AppState) => state.wallet.balances);
  const totalInvestedAmount = useSelector((state: AppState) => state.balancer.totalInvestedAmount);
  const userSummary = useAaveUserSummary();
  // const user
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
            totalWalletBalances += parseFloat(formatUnits(balance, decimals)) * data.current_price;
          }
        } catch (error: any) {
          console.error(error);
        }
      }
      if (totalInvestedAmount && totalInvestedAmount > 0) {
        totalWalletBalances += totalInvestedAmount;
      }
      setTotalAssets(totalAaveDeposits + totalWalletBalances);
      setTotalDebts(totalAaveDebts);
    }
    if (!healthFactor && userSummary) {
      setHealthFactor(parseFloat(userSummary.healthFactor).toFixed(2));
    }
  }, [userSummary, walletBalances, totalInvestedAmount]);

  return (
    <div>
      <div className={'flex-row-center justify-between'}>
        <span className={'text-header'}>Dashboard</span>
      </div>
      <HorizontalLineBreak />
      <div className={'flex-row-center justify-evenly flex-wrap'}>
        <div className={'bg-gray-100 w-1/2 md:w-1/4 rounded-2xl p-2'}>
          Net worth:{' '}
          <span className={'font-mono'}>
            $
            {(totalAssets - totalDebts).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </span>
        </div>
        <div className={'bg-gray-100 w-1/2 md:w-1/4 rounded-2xl p-2'}>
          Total assets:{' '}
          <span className={'font-mono'}>
            $
            {totalAssets.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </span>{' '}
        </div>
        <div className={'bg-gray-100 w-1/2 md:w-1/4 rounded-2xl p-2'}>
          Total debts:{' '}
          <span className={'font-mono'}>
            $
            {totalDebts.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </span>
        </div>
        <div className={'bg-gray-100 w-1/2 md:w-1/4 rounded-2xl p-2'}>
          Health factor{' '}
          <span className={'font-mono'}>
            <HealthFactorNumber healthFactor={healthFactor} />
          </span>
        </div>
      </div>
      <HorizontalLineBreak />
      <UserPools />
      <HorizontalLineBreak />
      <div>
        <DashboardLink text={'Wallet'} navTab={NavTab.WALLET} />
        {Object.values(tokenSet).map((token: EvmTokenDefinition) => (
          <WalletBalance key={token.symbol} token={token} hideZeroBalance={true} />
        ))}
      </div>
      <HorizontalLineBreak />
      <div>
        <DashboardLink text={'Borrows'} navTab={NavTab.BORROW} />
        <div className={'mt-2'}>
          <UserBorrowSummary />
        </div>
      </div>
      <HorizontalLineBreak />
      <div>
        <DashboardLink text={'Deposits'} navTab={NavTab.DEPOSIT} />
        <div className={'mt-2'}>
          <UserDepositSummary />
        </div>
      </div>
    </div>
  );
}
