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
import AaveFunctionButton from '_components/aave/AaveFunctionButton';
import AaveFunctionDeposit from '_components/aave/functions/AaveFunctionDeposit';
import AaveFunctionWithdraw from '_components/aave/functions/AaveFunctionWithdraw';
import AaveFunctionBorrow from '_components/aave/functions/AaveFunctionBorrow';
import AaveFunctionRepay from '_components/aave/functions/AaveFunctionRepay';

// TODO huge refactor needed, too big
export default function AaveReserveRow({
  reserveSymbol,
  aaveSection
}: {
  reserveSymbol: string;
  aaveSection: AaveSection;
}) {
  const aaveReserves = useAaveReserves();
  const userSummary = useAaveUserSummary();
  const { tokenSet } = useSelector((state: AppState) => state.web3);
  // TODO- centralise this
  const marketPrices = useMarketPrices();
  const [reserve, setReserve] = useState<ComputedReserveData | undefined>();
  const [userReserve, setUserReserve] = useState<ComputedUserReserve | undefined>();
  const [isExpanded, setIsExpanded] = useState(false);
  const [tokenApproved, setTokenApproved] = useState<boolean>(false);
  const [approvalTransactionHash, setApprovalTransactionHash] = useState<string>('');
  const [actionTransactionHash, setActionTransactionHash] = useState<string>();
  const [transactionInProgress, setTransactionInProgress] = useState<boolean>(false);
  const [transactionError, setTransactionError] = useState<string>('');
  const [transactionConfirmed, setTransactionConfirmed] = useState<boolean>(false);
  const [aaveFunction, setAaveFunction] = useState<AaveFunction | null>(null);
  const [token, setToken] = useState<EvmTokenDefinition | undefined>();
  const walletBalances = useWalletBalances();

  const [userBalance, setUserBalance] = useState<BigNumber | undefined>();
  useEffect(() => {
    if (token) {
      setUserBalance(walletBalances[token.symbol]?.balance);
    }
  }, [walletBalances, token]);

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
    if (userSummary) {
      const ur = userSummary.reservesData.find(
        (ur) => ur.reserve.symbol.toLowerCase() === reserveSymbol.toLowerCase()
      );
      if (ur) {
        setUserReserve(ur);
      }
    }
  }, [aaveReserves, userSummary]);

  //

  const resetTransactionState = () => {
    if (transactionConfirmed) {
      setTransactionConfirmed(false);
    }
    if (transactionInProgress) {
      setTransactionInProgress(false);
    }
    if (transactionError) {
      setTransactionError('');
    }
    if (approvalTransactionHash) {
      setApprovalTransactionHash('');
    }
    if (actionTransactionHash) {
      setActionTransactionHash('');
    }
    if (tokenApproved) {
      setTokenApproved(false);
    }
  };

  const handleFunctionButtonClicked = async (functionName: AaveFunction) => {
    if (!transactionInProgress || transactionError) {
      if (!aaveFunction || (aaveFunction && aaveFunction !== functionName)) {
        setAaveFunction(functionName);
      } else {
        setAaveFunction(null);
      }
      resetTransactionState();
    }
  };

  const borrowButtonDisabled = (): boolean => {
    return (
      (userSummary && parseFloat(userSummary.availableBorrowsETH) <= 0) ||
      (transactionInProgress && !transactionError)
    );
  };

  const withdrawButtonDisabled = (): boolean => {
    return (
      !userReserve ||
      parseFloat(userReserve.underlyingBalance) === 0 ||
      (transactionInProgress && !transactionError)
    );
  };

  const repayButtonDisabled = (): boolean => {
    return (
      !userReserve ||
      parseFloat(userReserve.variableBorrows) === 0 ||
      (transactionInProgress && !transactionError)
    );
  };

  const depositButtonDisabled = (): boolean => {
    return !userBalance || userBalance.isZero() || (transactionInProgress && !transactionError);
  };

  const getAaveFunctionContent = (): JSX.Element | null => {
    if (!reserve || !token || !userReserve) {
      return null;
    }
    switch (aaveFunction) {
      case AaveFunction.Deposit:
        return (
          <AaveFunctionDeposit
            reserve={reserve}
            token={token}
            transactionInProgress={transactionInProgress}
          />
        );
      case AaveFunction.Withdraw:
        return (
          <AaveFunctionWithdraw
            reserve={reserve}
            token={token}
            transactionInProgress={transactionInProgress}
          />
        );
      case AaveFunction.Borrow:
        return (
          <AaveFunctionBorrow
            reserve={reserve}
            token={token}
            transactionInProgress={transactionInProgress}
          />
        );
      case AaveFunction.Repay:
        return (
          <AaveFunctionRepay
            reserve={reserve}
            token={token}
            transactionInProgress={transactionInProgress}
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
            {aaveSection === AaveSection.Borrow && (
              <div className={'flex flex-col md:flex-row items-center'}>
                <AaveFunctionButton
                  activeFunctionName={aaveFunction}
                  handleClicked={handleFunctionButtonClicked}
                  functionName={AaveFunction.Borrow}
                  disabled={borrowButtonDisabled()}
                />
                <AaveFunctionButton
                  activeFunctionName={aaveFunction}
                  handleClicked={handleFunctionButtonClicked}
                  functionName={AaveFunction.Repay}
                  disabled={repayButtonDisabled()}
                />
              </div>
            )}
            {aaveSection === AaveSection.Deposit && (
              <div className={'flex flex-col md:flex-row items-center'}>
                <AaveFunctionButton
                  activeFunctionName={aaveFunction}
                  handleClicked={handleFunctionButtonClicked}
                  functionName={AaveFunction.Deposit}
                  disabled={depositButtonDisabled()}
                />
                <AaveFunctionButton
                  activeFunctionName={aaveFunction}
                  handleClicked={handleFunctionButtonClicked}
                  functionName={AaveFunction.Withdraw}
                  disabled={withdrawButtonDisabled()}
                />
              </div>
            )}
          </div>
          <DefaultTransition isOpen={aaveFunction !== null}>
            <div>
              <div className={'flex flex-col md:flex-row justify-between space-x-0 sm:space-x-2'}>
                <div className={'flex flex-col w-full'}>{getAaveFunctionContent()}</div>
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
