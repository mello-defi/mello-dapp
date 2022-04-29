import React, { useEffect, useState } from 'react';
import { ComputedReserveData } from '@aave/protocol-js';
import { ComputedUserReserve } from '@aave/protocol-js/dist/v2/types';
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { DefaultTransition } from '_components/core/Transition';
import AaveReserveApyData from '_components/aave/AaveReserveApyData';
import { TransactionStep } from '_components/transactions/TransactionStep';
import BlockExplorerLink from '_components/core/BlockExplorerLink';
import TransactionError from '_components/transactions/TransactionError';
import { BigNumber } from 'ethers';
import useWalletBalances from '_hooks/useWalletBalances';
import { EvmTokenDefinition } from '_enums/tokens';
import useMarketPrices from '_hooks/useMarketPrices';
import { AaveFunction, AaveSection } from '_enums/aave';
import useAaveReserves from '_hooks/useAaveReserves';
import useAaveUserSummary from '_hooks/useAaveUserSummary';
import { ExpandMore } from '@mui/icons-material';
import AaveReserveFunctionDeposit from '_components/aave/functions/AaveReserveFunctionDeposit';
import AaveReserveFunctionWithdraw from '_components/aave/functions/AaveReserveFunctionWithdraw';
import AaveReserveFunctionBorrow from '_components/aave/functions/AaveReserveFunctionBorrow';
import AaveReserveFunctionRepay from '_components/aave/functions/AaveReserveFunctionRepay';
import { TabHeader, TabHeaderContainer } from '_components/core/Tabs';
import useTransactionState from '_hooks/useTransactionState';

export default function AaveReserveCard({
  reserveSymbol,
  aaveSection
}: {
  reserveSymbol: string;
  aaveSection: AaveSection;
}) {
  const aaveReserves = useAaveReserves();
  const userSummary = useAaveUserSummary();
  const transactionState = useTransactionState();
  const {
    resetTransactionState,
    transactionInProgress,
    transactionConfirmed,
    transactionError,
    tokenApproved,
    approvalTransactionHash,
    actionTransactionHash
  } = transactionState;
  const { tokenSet } = useSelector((state: AppState) => state.web3);
  const marketPrices = useMarketPrices();
  const [reserve, setReserve] = useState<ComputedReserveData | undefined>();
  const [isExpanded, setIsExpanded] = useState(false);
  const [aaveFunction, setAaveFunction] = useState<AaveFunction | null>(null);
  const [token, setToken] = useState<EvmTokenDefinition | undefined>();

  useEffect(() => {
    if (!token) {
      setToken(
        Object.values(tokenSet).find((t) => t.symbol.toLowerCase() === reserveSymbol.toLowerCase())
      );
    }
  }, [reserveSymbol, token, tokenSet]);

  useEffect(() => {
    if (!reserve && aaveReserves) {
      const r = aaveReserves.find(
        (res) => res.symbol.toLowerCase() === reserveSymbol.toLowerCase()
      );
      if (r) {
        setReserve(r);
      }
    }
  }, [aaveReserves, userSummary]);

  const getFunctionTabs = (): JSX.Element[] | null => {
    if (!reserve || !token) {
      return null;
    }
    let tabs: AaveFunction[] = [];
    switch (aaveSection) {
      case AaveSection.Borrow:
        tabs = [AaveFunction.Borrow, AaveFunction.Repay];
        break;
      case AaveSection.Deposit:
        tabs = [AaveFunction.Supply, AaveFunction.Withdraw];
        break;
      default:
        return null;
    }
    return tabs.map((functionName) => {
      return (
        <TabHeader
          title={functionName}
          key={functionName}
          isActive={aaveFunction === functionName}
          onClick={() => setAaveFunction(functionName)}
        />
      );
    });
  };
  const getFunctionContent = (): JSX.Element | null => {
    if (!reserve || !token) {
      return null;
    }
    // set default function
    if (!aaveFunction) {
      if (aaveSection === AaveSection.Deposit) {
        setAaveFunction(AaveFunction.Supply);
      } else if (aaveSection === AaveSection.Borrow) {
        setAaveFunction(AaveFunction.Borrow);
      }
    }
    switch (aaveFunction) {
      case AaveFunction.Supply:
        return (
          <AaveReserveFunctionDeposit
            reserve={reserve}
            token={token}
            transactionState={transactionState}
          />
        );
      case AaveFunction.Withdraw:
        return (
          <AaveReserveFunctionWithdraw
            reserve={reserve}
            token={token}
            transactionState={transactionState}
          />
        );
      case AaveFunction.Borrow:
        return (
          <AaveReserveFunctionBorrow
            reserve={reserve}
            token={token}
            transactionState={transactionState}
          />
        );
      case AaveFunction.Repay:
        return (
          <AaveReserveFunctionRepay
            reserve={reserve}
            token={token}
            transactionState={transactionState}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {marketPrices && reserve && token && (
        <div
          className={'bg-white rounded-2xl px-4 py-4 mb-2 border-2 -mx-1 border-gray-50 shadow-sm'}
        >
          <div className={'flex-row-center justify-between'}>
            <AaveReserveApyData reserve={reserve} aaveSection={aaveSection} />
            <div className={'text-3xl'}>
              <ExpandMore
                onClick={() => setIsExpanded(!isExpanded)}
                fontSize={'inherit'}
                className={'cursor-pointer text-color-light hover:text-black transition ml-2 mb-1'}
              />
            </div>
          </div>
          <DefaultTransition isOpen={isExpanded}>
            <div>
              <TabHeaderContainer>{getFunctionTabs()}</TabHeaderContainer>
              <div className={'flex flex-col md:flex-row justify-between space-x-0 sm:space-x-2'}>
                <div className={'flex flex-col w-full'}>{getFunctionContent()}</div>
              </div>
              {(transactionInProgress || transactionConfirmed) && (
                <div className={'my-2'}>
                  <TransactionStep
                    show={true}
                    transactionError={transactionError}
                    stepComplete={tokenApproved}
                  >
                    {tokenApproved ? 'Token approved' : 'Approving token'}
                    <BlockExplorerLink transactionHash={approvalTransactionHash} />
                  </TransactionStep>
                  <TransactionStep
                    showTransition={false}
                    show={tokenApproved}
                    transactionError={transactionError}
                    stepComplete={transactionConfirmed}
                  >
                    {transactionConfirmed
                      ? `${aaveFunction} confirmed`
                      : `Confirming ${aaveFunction?.toLowerCase()}`}
                    <BlockExplorerLink transactionHash={actionTransactionHash} />
                  </TransactionStep>
                  <TransactionError
                    onClickClear={resetTransactionState}
                    transactionError={transactionError}
                  />
                </div>
              )}
            </div>
          </DefaultTransition>
        </div>
      )}
    </>
  );
}
