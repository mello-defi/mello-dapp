import React, { useEffect, useState } from 'react';
import { ComputedReserveData, EthereumTransactionTypeExtended, UserSummaryData } from '@aave/protocol-js';
import { ComputedUserReserve } from '@aave/protocol-js/dist/v2/types';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { DefaultTransition } from '_components/core/Transition';
import AaveReserveMarketData from '_components/aave/AaveReserveMarketData';
import { TransactionStep } from '_components/transactions/TransactionStep';
import BlockExplorerLink from '_components/core/BlockExplorerLink';
import TransactionError from '_components/transactions/TransactionError';
import { BigNumber, ethers } from 'ethers';
import {
  calculateNewHealthFactor,
  getBorrowTransactions,
  getDepositTransactions,
  getMarketDataForSymbol,
  getRepayTransactions,
  getWithdrawTransactions,
  runAaveActionTransaction,
  runAaveApprovalTransaction
} from '_services/aaveService';
import { getBalanceForToken, toggleBalancesAreStale } from '_redux/effects/walletEffects';
import useWalletBalance from '_hooks/useWalletBalance';
import { TokenDefinition } from '_enums/tokens';
import useMarketPrices from '_hooks/useMarketPrices';
import { HorizontalLineBreak } from '_components/core/HorizontalLineBreak';
import { AaveFunction, AaveSection } from '_enums/aave';
import AaveFunctionButton from '_components/aave/AaveFunctionButton';
import AaveFunctionContent from '_components/aave/AaveFunctionContent';
import { EthereumTransactionError } from '_interfaces/errors';

export default function AaveReserve({
  reserve,
  userReserve,
  aaveSection,
  userSummaryData,
  maxBorrowAmount,
  token
}: {
  reserve: ComputedReserveData;
  userReserve?: ComputedUserReserve;
  aaveSection: AaveSection;
  userSummaryData: UserSummaryData;
  maxBorrowAmount?: string;
  token: TokenDefinition;
}) {
  const dispatch = useDispatch();
  const provider = useSelector((state: AppState) => state.web3.provider);
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const marketPrices = useMarketPrices();
  const [marketPriceForToken, setMarketPriceForToken] = useState<number | undefined>(undefined);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [borrowAmount, setBorrowAmount] = useState<string>('');
  const [repayAmount, setRepayAmount] = useState<string>('');
  const [borrowSubmitting, setBorrowSubmitting] = useState(false);
  const [repaySubmitting, setRepaySubmitting] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('0.0');
  const [depositSubmitting, setDepositSubmitting] = useState<boolean>(false);
  const [updatedHealthFactor, setUpdatedHealthFactor] = useState<string>('');
  const [withdrawSubmitting, setWithdrawSubmitting] = useState<boolean>(false);
  const [tokenApproved, setTokenApproved] = useState<boolean>(false);
  const [approvalTransactionHash, setApprovalTransactionHash] = useState<string>('');
  const [actionTransactionHash, setActionTransactionHash] = useState<string>();
  const [transactionInProgress, setTransactionInProgress] = useState<boolean>(false);
  const [transactionError, setTransactionError] = useState<string>('');
  const [transactionConfirmed, setTransactionConfirmed] = useState<boolean>(false);
  const [aaveFunction, setAaveFunction] = useState<AaveFunction | null>(null);
  const userBalance = useWalletBalance(token);

  useEffect(() => {
    if (token && marketPrices) {
      const marketPrice = getMarketDataForSymbol(marketPrices, token.symbol);
      setMarketPriceForToken(marketPrice.current_price);
    }
  }, [token, marketPrices]);

  const runAaveTransactions = async (
    provider: ethers.providers.Web3Provider,
    transactions: EthereumTransactionTypeExtended[]
  ) => {
    const approvalHash = await runAaveApprovalTransaction(transactions, provider);
    if (approvalHash) {
      const tx = await provider.getTransaction(approvalHash);
      await tx.wait(1);
      setApprovalTransactionHash(approvalHash);
    }
    setTokenApproved(true);
    const actionHash = await runAaveActionTransaction(transactions, provider);
    setActionTransactionHash(actionHash);
    if (actionHash) {
      const tx = await provider.getTransaction(actionHash);
      await tx.wait(1);
    }
    setTransactionConfirmed(true);

    if (token && userAddress) {
      dispatch(getBalanceForToken(token, provider, userAddress, true));
    }
  };

  useEffect(() => {
    if (reserve && depositAmount && parseFloat(depositAmount) > 0) {
      // sethh calculateNewHealthFactor(reserve)
      setUpdatedHealthFactor(calculateNewHealthFactor(reserve, userSummaryData, depositAmount));
    }
  }, [depositAmount]);

  const handleAaveFunction = async (
    amount: string,
    setAmount: (amount: string) => void,
    setFunctionSubmitting: (value: boolean) => void,
    getTransactions: (
      provider: ethers.providers.Web3Provider,
      userAddress: string,
      underlyingAsset: string,
      amount: string
    ) => Promise<EthereumTransactionTypeExtended[]>
  ) => {
    if (provider && userAddress) {
      try {
        setTransactionInProgress(true);
        setFunctionSubmitting(true);
        const transactions: EthereumTransactionTypeExtended[] = await getTransactions(
          provider,
          userAddress,
          reserve.underlyingAsset,
          amount
        );
        await runAaveTransactions(provider, transactions);
        setAmount('0.0');
        setTransactionInProgress(false);
        dispatch(toggleBalancesAreStale(true))
      } catch (e: any) {
        const errorParsed = typeof e === 'string' ? (JSON.parse(e) as EthereumTransactionError) : e;
        setTransactionError(
          `${errorParsed.message}${errorParsed.data ? ' - ' + errorParsed.data.message : ''}`
        );
      }
      setFunctionSubmitting(false);
    }
  };
  const handleBorrow = async () => {
    if (borrowAmount && provider && userAddress) {
      await handleAaveFunction(
        borrowAmount,
        setBorrowAmount,
        setBorrowSubmitting,
        getBorrowTransactions
      );
    }
  };

  const handleRepay = async () => {
    if (repayAmount && provider && userAddress) {
      await handleAaveFunction(
        repayAmount,
        setRepayAmount,
        setRepaySubmitting,
        getRepayTransactions
      );
    }
  };

  const handleDeposit = async () => {
    if (depositAmount && provider && userAddress) {
      await handleAaveFunction(
        depositAmount,
        setDepositAmount,
        setDepositSubmitting,
        getDepositTransactions
      );
    }
  };

  const handleWithdraw = async () => {
    if (withdrawAmount && provider) {
      await handleAaveFunction(
        withdrawAmount,
        setWithdrawAmount,
        setWithdrawSubmitting,
        getWithdrawTransactions
      );
    }
  };

  const handleFunctionButtonClicked = async (functionName: AaveFunction) => {
    if (!aaveFunction || (aaveFunction && aaveFunction !== functionName)) {
      setAaveFunction(functionName);
    } else {
      setAaveFunction(null);
    }
  };
  return (
    <>
      {marketPrices && (
        <div className={'bg-white rounded-2xl px-4 py-4 mb-2 border-2 -mx-1 border-gray-50 shadow-sm'}>
          <div className={'flex-row-center justify-between'}>
            <AaveReserveMarketData reserve={reserve} aaveSection={aaveSection} />
            {aaveSection === AaveSection.Borrow && (
              <div className={'flex flex-col md:flex-row items-center'}>
                <AaveFunctionButton
                  activeFunctionName={aaveFunction}
                  handleClicked={handleFunctionButtonClicked}
                  functionName={AaveFunction.Borrow}
                />
                <AaveFunctionButton
                  activeFunctionName={aaveFunction}
                  handleClicked={handleFunctionButtonClicked}
                  functionName={AaveFunction.Repay}
                />
              </div>
            )}
            {aaveSection === AaveSection.Deposit && (
              <div className={'flex flex-col md:flex-row items-center'}>
                <AaveFunctionButton
                  activeFunctionName={aaveFunction}
                  handleClicked={handleFunctionButtonClicked}
                  functionName={AaveFunction.Deposit}
                />
                <AaveFunctionButton
                  activeFunctionName={aaveFunction}
                  handleClicked={handleFunctionButtonClicked}
                  functionName={AaveFunction.Withdraw}
                />
              </div>
            )}
          </div>
          <DefaultTransition isOpen={aaveFunction !== null}>
            <div>
              <HorizontalLineBreak />
              {marketPriceForToken && (
                <div className={'flex flex-col md:flex-row justify-between space-x-0 sm:space-x-2'}>
                  <div className={'flex flex-col w-full'}>
                    {aaveFunction === AaveFunction.Deposit && (
                      <AaveFunctionContent
                        reserveTitle={'Wallet'}
                        summaryTitle={'Amount to deposit'}
                        userBalance={userBalance}
                        tokenPrice={marketPriceForToken}
                        amount={depositAmount}
                        setAmount={setDepositAmount}
                        token={token}
                        buttonOnClick={handleDeposit}
                        buttonDisabled={
                          !userBalance ||
                          userBalance.isZero() ||
                          transactionInProgress ||
                          (depositAmount
                            ? userBalance.lt(ethers.utils.parseUnits(depositAmount, token.decimals))
                            : true)
                        }
                      >
                        <span>{depositSubmitting ? 'Submitting...' : 'Deposit'}</span>
                      </AaveFunctionContent>
                    )}
                    {aaveFunction === AaveFunction.Withdraw && (
                      <AaveFunctionContent
                        reserveTitle={'Deposited'}
                        summaryTitle={'Amount to withdraw'}
                        userBalance={
                          userReserve
                            ? ethers.utils.parseUnits(userReserve.underlyingBalance, token.decimals)
                            : BigNumber.from('0')
                        }
                        tokenPrice={marketPriceForToken}
                        amount={withdrawAmount}
                        setAmount={setWithdrawAmount}
                        token={token}
                        buttonOnClick={handleWithdraw}
                        buttonDisabled={
                          transactionInProgress ||
                          !userReserve ||
                          parseFloat(userReserve.underlyingBalance) === 0 ||
                          (withdrawAmount && userReserve?.underlyingBalance
                            ? parseFloat(withdrawAmount) > parseFloat(userReserve.underlyingBalance)
                            : false)
                        }
                      >
                        <span className={'ml-2'}>
                          {withdrawSubmitting ? 'Submitting...' : 'Withdraw'}
                        </span>
                      </AaveFunctionContent>
                    )}
                    {aaveFunction === AaveFunction.Borrow && (
                      <AaveFunctionContent
                        reserveTitle={'Borrowing power'}
                        summaryTitle={'Amount to borrow'}
                        userBalance={
                          maxBorrowAmount
                            ? ethers.utils.parseUnits(maxBorrowAmount, token.decimals)
                            : BigNumber.from('0')
                        }
                        tokenPrice={marketPriceForToken}
                        amount={borrowAmount}
                        setAmount={setBorrowAmount}
                        token={token}
                        buttonOnClick={handleBorrow}
                        buttonDisabled={transactionInProgress}
                      >
                        <span className={'ml-2'}>
                          {borrowSubmitting ? 'Submitting...' : 'Borrow'}
                        </span>
                      </AaveFunctionContent>
                    )}
                    {aaveFunction === AaveFunction.Repay && (
                      <AaveFunctionContent
                        reserveTitle={'Borrowed'}
                        summaryTitle={'Amount to repay'}
                        userBalance={
                          userReserve
                            ? ethers.utils.parseUnits(userReserve.variableBorrows, token.decimals)
                            : BigNumber.from('0')
                        }
                        tokenPrice={marketPriceForToken}
                        amount={repayAmount}
                        setAmount={setRepayAmount}
                        token={token}
                        buttonOnClick={handleRepay}
                        buttonDisabled={
                          transactionInProgress ||
                          !userReserve ||
                          parseFloat(userReserve?.variableBorrows) === 0 ||
                          (repayAmount && userReserve?.variableBorrows
                            ? parseFloat(repayAmount) > parseFloat(userReserve?.variableBorrows)
                            : false)
                        }
                      >
                        <span className={'ml-2'}>
                          {repaySubmitting ? 'Submitting...' : 'Repay'}
                        </span>
                      </AaveFunctionContent>
                    )}
                  </div>
                </div>
              )}
              {(transactionInProgress || transactionConfirmed) && (
                <div className={'my-2'}>
                  <TransactionStep
                    show={true}
                    transactionError={transactionError}
                    stepComplete={tokenApproved}
                  >
                    Token is approved
                    <BlockExplorerLink transactionHash={approvalTransactionHash} />
                  </TransactionStep>
                  <TransactionStep
                    showTransition={false}
                    show={tokenApproved}
                    transactionError={transactionError}
                    stepComplete={transactionConfirmed}
                  >
                    {aaveFunction} confirmed
                    <BlockExplorerLink transactionHash={actionTransactionHash} />
                  </TransactionStep>
                  <TransactionError transactionError={transactionError} />
                </div>
              )}
            </div>
          </DefaultTransition>
        </div>
      )}
    </>
  );
}
