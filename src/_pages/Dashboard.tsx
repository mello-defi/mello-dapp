import React from 'react';
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

function DashboardLink({text, navTab}: {text: string, navTab: NavTab }) {
  const dispatch = useDispatch();
  return (
    <div
    onClick={() => dispatch(setActiveTab(navTab))}
    className={"flex-row-center cursor-pointer hover:text-gray-400 transition"}>
      <span
        className={"text-body"}>{text}</span>
      <ArrowForward className={"ml-2"}/>
    </div>
  )
}

export default function Dashboard() {
  const tokenSet = useSelector((state: AppState) => state.web3.tokenSet);
  const aaveReserves = useAaveReserves()
  const userSummary = useAaveUserSummary();
  return (
    <div>
      <div className={'flex-row-center justify-between'}>
        <span className={'text-header'}>Dashboard</span>
      </div>
      <HorizontalLineBreak />
      <div>
        <DashboardLink text={'Wallet'} navTab={NavTab.WALLET} />
        {Object.values(tokenSet).map((token: TokenDefinition) => (
          <WalletBalance key={token.symbol} token={token} hideZeroBalance={true} />
        ))}
      </div>
      <div>
        <DashboardLink text={'Borrows'} navTab={NavTab.BORROW} />
        <div className={"mt-2"}>
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
      <div>
        <DashboardLink text={'Deposits'} navTab={NavTab.DEPOSIT} />
        <div className={"mt-2"}>
          {userSummary && userSummary.reservesData && userSummary.reservesData.length > 0 ? (
            <div>
              {userSummary.reservesData
                .filter(
                  (reserve: ComputedUserReserve) =>
                    parseFloat(parseFloat(reserve.underlyingBalance).toFixed(6)) > 0
                )
                .sort((a, b) => parseFloat(b.underlyingBalanceETH) - parseFloat(a.underlyingBalanceETH))
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
  )
}