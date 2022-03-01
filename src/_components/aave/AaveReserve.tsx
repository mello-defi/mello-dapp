import { Button, ButtonSize, ButtonVariant } from '_components/core/Buttons';
import React, { useEffect, useState } from 'react';
import { ComputedReserveData, EthereumTransactionTypeExtended } from '@aave/protocol-js';
import { ComputedUserReserve } from '@aave/protocol-js/dist/v2/types';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { DefaultTransition } from '_components/core/Transition';
import { Spinner, SpinnerSize } from '_components/core/Animations';
import AaveReserveMarketData from '_components/aave/AaveReserveMarketData';
import { TransactionStep } from '_components/transactions/TransactionStep';
import BlockExplorerLink from '_components/core/BlockExplorerLink';
import TransactionError from '_components/transactions/TransactionError';
import { ethers } from 'ethers';
import {
  getBorrowTransactions,
  getDepositTransactions,
  getMarketDataForSymbol,
  getRepayTransactions,
  getWithdrawTransactions,
  runAaveActionTransaction,
  runAaveApprovalTransaction
} from '_services/aaveService';
import { CryptoCurrencySymbol } from '_enums/currency';
import { getBalanceForToken } from '_redux/effects/walletEffects';
import useWalletBalance from '_hooks/useWalletBalance';
import { TokenDefinition } from '_enums/tokens';
import useMarketPrices from '_hooks/useMarketPrices';
import { HorizontalLineBreak } from '_components/core/HorizontalLineBreak';
import { AaveFunction, AaveSection } from '_enums/aave';
import AaveFunctionButton from '_components/aave/AaveFunctionButton';
import AaveFunctionContent from '_components/aave/AaveFunctionContent';


export default function AaveReserve({
  reserve,
  userReserve,
  aaveSection,
  maxBorrowAmount,
  token
}: {
  reserve: ComputedReserveData;
  userReserve?: ComputedUserReserve;
  aaveSection: AaveSection;
  maxBorrowAmount?: string;
  token: TokenDefinition;
}) {
  const dispatch = useDispatch();
  const [isExpanded, setIsExpanded] = useState(false);
  const provider = useSelector((state: AppState) => state.web3.provider);
  const network = useSelector((state: AppState) => state.web3.network);
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const marketPrices = useMarketPrices();
  const [marketPriceForToken, setMarketPriceForToken] = useState<number | undefined>(undefined);
  const [depositAmount, setDepositAmount] = useState<number>(0.0);
  const [borrowAmount, setBorrowAmount] = useState<number>(0.0);
  const [repayAmount, setRepayAmount] = useState<number>(0.0);
  const [borrowSubmitting, setBorrowSubmitting] = useState(false);
  const [repaySubmitting, setRepaySubmitting] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0.0);
  const [depositSubmitting, setDepositSubmitting] = useState<boolean>(false);
  const [withdrawSubmitting, setWithdrawSubmitting] = useState<boolean>(false);
  const [tokenApproved, setTokenApproved] = useState<boolean>(false);
  const [approvalTransactionHash, setApprovalTransactionHash] = useState<string>('');
  const [actionTransactionHash, setActionTransactionHash] = useState<string>();
  const [transactionStarted, setTransactionStarted] = useState<boolean>(false);
  const [transactionError, setTransactionError] = useState<string>('');
  const [transactionSubmitted, setTransactionSubmitted] = useState<boolean>(false);
  const [transactionConfirmed, setTransactionConfirmed] = useState<boolean>(false);
  const [aaveFunction, setAaveFunction] = useState<AaveFunction | null>();
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
    console.log('runAaveTransactions', transactions);
    const approvalHash = await runAaveApprovalTransaction(transactions, provider);
    console.log('approvalHash', approvalHash);
    if (approvalHash) {
      const tx = await provider.getTransaction(approvalHash);
      await tx.wait(1);
      setApprovalTransactionHash(approvalHash);
    }
    setTokenApproved(true);
    const actionHash = await runAaveActionTransaction(transactions, provider);
    setTransactionSubmitted(true);
    console.log('actionHash', actionHash);
    setActionTransactionHash(actionHash);
    if (actionHash) {
      const tx = await provider.getTransaction(actionHash);
      await tx.wait(1);
    }
    setTransactionConfirmed(true);
    if (token) {
      dispatch(getBalanceForToken(token, provider, userAddress, true));
    }
  };


  const handleAaveFunction = async (
    amount: number,
    setFunctionSubmitting: (value: boolean) => void,
    getTransactions: (provider: ethers.providers.Web3Provider, userAddress: string, underlyingAsset: string, amount: number) => Promise<EthereumTransactionTypeExtended[]>) => {
    if (provider) {
      try {
        setTransactionStarted(true);
        setFunctionSubmitting(true);
        const transactions: EthereumTransactionTypeExtended[] = await getTransactions(provider, userAddress, reserve.underlyingAsset, amount);
        await runAaveTransactions(provider, transactions);
      } catch (e: any) {
        setTransactionError(transactionError + '\n' + e.message);
      }
      setFunctionSubmitting(false);
    }
  }
  const handleBorrow = async () => {
    if (borrowAmount && provider && userAddress) {
      await handleAaveFunction(borrowAmount, setBorrowSubmitting, getBorrowTransactions);
    }
  };

  const handleRepay = async () => {
    if (repayAmount && provider && userAddress) {
      await handleAaveFunction(repayAmount, setRepaySubmitting, getRepayTransactions);
    }
  };

  const handleDeposit = async () => {
    if (depositAmount && provider && userAddress) {
      await handleAaveFunction(depositAmount, setDepositSubmitting, getDepositTransactions);
    }
  };

  const handleWithdraw = async () => {
    if (withdrawAmount && provider) {
      await handleAaveFunction(withdrawAmount, setWithdrawSubmitting, getWithdrawTransactions);
    }
  };

  const handleFunctionButtonClicked = async (functionName: AaveFunction) => {
    const newIsExpanded = !isExpanded;
    if (!aaveFunction || functionName === aaveFunction) {
      setIsExpanded(newIsExpanded);
    }
    if (newIsExpanded) {
      setAaveFunction(functionName);
    } else {
      setAaveFunction(null);
    }
  };

  return (
    <>
      {marketPrices && (
        <div className={'bg-white rounded-xl px-4 py-4 mb-2 border-2 -mx-1 border-gray-50'}>
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
          <DefaultTransition isOpen={isExpanded}>
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
                          transactionStarted ||
                          parseFloat(userBalance) === 0 ||
                          (!depositAmount ? false : depositAmount > parseFloat(userBalance)) ||
                          (token.symbol.toUpperCase() ===
                            CryptoCurrencySymbol.WMATIC.toUpperCase() &&
                            depositAmount === parseFloat(userBalance))
                        }
                      >
                        <Spinner show={depositSubmitting} size={SpinnerSize.SMALL} />
                        <span>
                          {depositSubmitting
                            ? 'Submitting...'
                            : `${
                                token.symbol.toUpperCase() ===
                                  CryptoCurrencySymbol.WMATIC.toUpperCase() &&
                                parseFloat(userBalance) > 0 &&
                                depositAmount === parseFloat(userBalance) 
                                  ? 'You cannot deposit all of your MATIC'
                                  : 'Deposit'
                              }`}
                        </span>
                      </AaveFunctionContent>
                    )}
                    {aaveFunction === AaveFunction.Withdraw && (
                      <AaveFunctionContent
                        reserveTitle={'Deposited'}
                        summaryTitle={'Amount to withdraw'}
                        userBalance={userReserve?.underlyingBalance}
                        tokenPrice={marketPriceForToken}
                        amount={withdrawAmount}
                        setAmount={setWithdrawAmount}
                        token={token}
                        buttonOnClick={handleWithdraw}
                        buttonDisabled={
                          transactionStarted ||
                          !userReserve ||
                          parseFloat(userReserve.underlyingBalance) === 0 ||
                          (withdrawAmount && userReserve?.underlyingBalance
                            ? withdrawAmount > parseFloat(userReserve.underlyingBalance)
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
                        userBalance={maxBorrowAmount}
                        tokenPrice={marketPriceForToken}
                        amount={borrowAmount}
                        setAmount={setBorrowAmount}
                        token={token}
                        buttonOnClick={handleBorrow}
                        buttonDisabled={transactionStarted}
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
                        userBalance={userReserve?.variableBorrows}
                        tokenPrice={marketPriceForToken}
                        amount={repayAmount}
                        setAmount={setRepayAmount}
                        token={token}
                        buttonOnClick={handleRepay}
                        buttonDisabled={
                          transactionStarted ||
                          !userReserve ||
                          parseFloat(userReserve?.variableBorrows) === 0 ||
                          (repayAmount && userReserve?.variableBorrows
                            ? repayAmount > parseFloat(userReserve?.variableBorrows)
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
              {transactionStarted && (
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
                    show={tokenApproved}
                    transactionError={transactionError}
                    stepComplete={transactionSubmitted}
                  >
                    Transaction submitted
                    <BlockExplorerLink transactionHash={actionTransactionHash} />
                  </TransactionStep>
                  <TransactionStep
                    showTransition={false}
                    show={transactionSubmitted}
                    transactionError={transactionError}
                    stepComplete={transactionConfirmed}
                  >
                    Transaction confirmed
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
