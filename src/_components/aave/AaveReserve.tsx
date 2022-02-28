import {Button} from '_components/core/Buttons';
import React, {useEffect, useState} from 'react';
import {ComputedReserveData, EthereumTransactionTypeExtended} from '@aave/protocol-js';
import {ComputedUserReserve} from '@aave/protocol-js/dist/v2/types';
import {useDispatch, useSelector} from 'react-redux';
import {AppState} from '_redux/store';
import {DefaultTransition} from '_components/core/Transition';
import {Spinner, SpinnerSize} from '_components/core/Animations';
import AaveReserveMarketData from '_components/aave/AaveReserveMarketData';
import TransactionAmountSummary from '_components/aave/TransactionAmountSummary';
import AmountInputWithPercentages from '_components/aave/AmountInputWithPercentages';
import UserReserveBalance from '_components/aave/UserReserveBalance';
import {TransactionStep} from '_components/transactions/TransactionStep';
import {initialiseParaSwap} from '_services/paraSwapService';
import BlockExplorerLink from '_components/core/BlockExplorerLink';
import TransactionError from '_components/transactions/TransactionError';
import {ethers} from 'ethers';
import {
  getBorrowTransactions,
  getDepositTransactions,
  getMarketDataForSymbol,
  getRepayTransactions,
  getWithdrawTransactions,
  runAaveActionTransaction,
  runAaveApprovalTransaction
} from '_services/aaveService';
import {CryptoCurrencySymbol} from '_enums/currency';
import {getBalanceForToken} from '_redux/effects/walletEffects';
import useWalletBalance from '_hooks/useWalletBalance';
import {TokenDefinition} from '_enums/tokens';
import useMarketPrices from '_hooks/useMarketPrices';
import {HorizontalLineBreak} from '_components/core/HorizontalLineBreak';

export enum AaveFeature {
  Lend = 'Lend',
  Borrow = 'Borrow'
}

// export function
export default function AaveReserve({
  reserve,
  userReserve,
  aaveFeature,
  maxBorrowAmount,
  token
}: {
  reserve: ComputedReserveData;
  userReserve?: ComputedUserReserve;
  aaveFeature: AaveFeature;
  maxBorrowAmount?: string;
  token: TokenDefinition;
}) {
  const dispatch = useDispatch();
  const [isExpanded, setIsExpanded] = useState(false);
  const provider = useSelector((state: AppState) => state.web3.provider);
  const network = useSelector((state: AppState) => state.web3.network);
  const userAddress = useSelector((state: AppState) => state.web3.userAddress);
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
  const userBalance = useWalletBalance(token);
  console.log('IN AAVE RESERVE');
  if (provider) {
    initialiseParaSwap(provider, network.chainId);
  }

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

  const handleBorrow = async () => {
    if (borrowAmount && provider && userAddress) {
      try {
        setTransactionStarted(true);
        setBorrowSubmitting(true);
        // setTransactionSubmitted(true);
        const transactions: EthereumTransactionTypeExtended[] = await getBorrowTransactions(
          provider,
          userAddress,
          reserve.underlyingAsset,
          borrowAmount
        );
        await runAaveTransactions(provider, transactions);
      } catch (e: any) {
        setTransactionError(transactionError + '\n' + e.message);
      }
      setBorrowSubmitting(false);
    }
  };

  const handleRepay = async () => {
    if (repayAmount && provider && userAddress) {
      try {
        setTransactionStarted(true);
        setRepaySubmitting(true);
        // setTransactionSubmitted(true);
        const transactions: EthereumTransactionTypeExtended[] = await getRepayTransactions(
          provider,
          userAddress,
          reserve.underlyingAsset,
          repayAmount
        );
        await runAaveTransactions(provider, transactions);
      } catch (e: any) {
        setTransactionError(transactionError + '\n' + e.message);
      }
      setRepaySubmitting(false);
    }
  };

  const handleDeposit = async () => {
    if (depositAmount && provider && userAddress) {
      try {
        setTransactionStarted(true);
        setDepositSubmitting(true);
        // setTransactionSubmitted(true);
        const transactions: EthereumTransactionTypeExtended[] = await getDepositTransactions(
          provider,
          userAddress,
          reserve.underlyingAsset,
          depositAmount
        );
        await runAaveTransactions(provider, transactions);
      } catch (e: any) {
        setTransactionError(transactionError + '\n' + e.message);
      }
      setDepositSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (withdrawAmount && provider) {
      try {
        setTransactionStarted(true);
        setWithdrawSubmitting(true);
        // setTransactionSubmitted(true);
        const transactions: EthereumTransactionTypeExtended[] = await getWithdrawTransactions(
          provider,
          userAddress,
          reserve.underlyingAsset,
          withdrawAmount
        );
        await runAaveTransactions(provider, transactions);
      } catch (e: any) {
        setTransactionError(e.message);
      }
      setWithdrawSubmitting(false);
    }
  };

  return (
    <>
      {marketPrices && (
        <div className={'bg-white rounded-xl px-4 py-4 mb-2 border-2 -mx-1 border-gray-50'}>
          <AaveReserveMarketData
            reserve={reserve}
            aaveFeature={aaveFeature}
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
          />
          <DefaultTransition isOpen={isExpanded}>
            <div>
              <HorizontalLineBreak />
              {marketPriceForToken && (
                <div className={'flex flex-col md:flex-row justify-between space-x-0 sm:space-x-2'}>
                  <div className={'flex flex-col w-full md:w-1/2'}>
                    {aaveFeature === AaveFeature.Lend && (
                      <>
                        <UserReserveBalance
                          title={'Wallet'}
                          userBalance={userBalance}
                          tokenPrice={marketPriceForToken}
                        />
                        <AmountInputWithPercentages
                          inputAmount={depositAmount}
                          setInputAmount={setDepositAmount}
                          baseAmount={userBalance}
                        />
                        <TransactionAmountSummary
                          tokenPrice={marketPriceForToken}
                          title={'Amount to deposit'}
                          amount={depositAmount}
                        />
                        <div className={'flex flex-col mt-2'}>
                          {token && (
                            <Button
                              onClick={handleDeposit}
                              disabled={
                                transactionStarted ||
                                parseFloat(userBalance) === 0 ||
                                (!depositAmount
                                  ? false
                                  : depositAmount > parseFloat(userBalance)) ||
                                (token.symbol.toUpperCase() ===
                                  CryptoCurrencySymbol.WMATIC.toUpperCase() &&
                                  depositAmount === parseFloat(userBalance))
                              }
                              className={'flex-row-center justify-center'}
                            >
                              <Spinner show={depositSubmitting} size={SpinnerSize.SMALL} />
                              <span>
                                {depositSubmitting
                                  ? 'Submitting...'
                                  : `${
                                      token.symbol.toUpperCase() ===
                                        CryptoCurrencySymbol.WMATIC.toUpperCase() &&
                                      depositAmount === parseFloat(userBalance)
                                        ? 'You cannot deposit all of your MATIC'
                                        : 'Deposit'
                                    }`}
                              </span>
                            </Button>
                          )}
                        </div>
                      </>
                    )}
                    {aaveFeature === AaveFeature.Borrow && (
                      <>
                        <UserReserveBalance
                          title={'Borrowing power'}
                          userBalance={maxBorrowAmount}
                          tokenPrice={marketPriceForToken}
                        />
                        <AmountInputWithPercentages
                          inputAmount={borrowAmount}
                          setInputAmount={setBorrowAmount}
                          baseAmount={maxBorrowAmount}
                        />
                        <TransactionAmountSummary
                          tokenPrice={marketPriceForToken}
                          title={'Amount to borrow'}
                          amount={borrowAmount}
                        />
                        <div className={'flex flex-col mt-2'}>
                          <Button
                            onClick={handleBorrow}
                            disabled={
                              transactionStarted
                              // !userReserve ||
                              // parseFloat(userReserve.underlyingBalance) === 0 ||
                              // (withdrawAmount && userReserve?.underlyingBalance
                              //   ? withdrawAmount > parseFloat(userReserve.underlyingBalance)
                              //   : false)
                            }
                            className={'flex-row-center justify-center'}
                          >
                            <span className={'ml-2'}>
                              {borrowSubmitting ? 'Submitting...' : 'Borrow'}
                            </span>
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                  <div className={'flex flex-col w-full md:w-1/2 mt-2 md:mt-0'}>
                    {aaveFeature === AaveFeature.Lend && (
                      <>
                        <UserReserveBalance
                          title={'Deposited'}
                          userBalance={userReserve?.underlyingBalance}
                          tokenPrice={marketPriceForToken}
                        />
                        <AmountInputWithPercentages
                          inputAmount={withdrawAmount}
                          setInputAmount={setWithdrawAmount}
                          baseAmount={userReserve?.underlyingBalance}
                        />
                        <TransactionAmountSummary
                          tokenPrice={marketPriceForToken}
                          title={'Amount to withdraw'}
                          amount={withdrawAmount}
                        />
                        <div className={'flex flex-col mt-2'}>
                          <Button
                            onClick={handleWithdraw}
                            disabled={
                              transactionStarted ||
                              !userReserve ||
                              parseFloat(userReserve.underlyingBalance) === 0 ||
                              (withdrawAmount && userReserve?.underlyingBalance
                                ? withdrawAmount > parseFloat(userReserve.underlyingBalance)
                                : false)
                            }
                            className={'flex-row-center justify-center'}
                          >
                            <span className={'ml-2'}>
                              {withdrawSubmitting ? 'Submitting...' : 'Withdraw'}
                            </span>
                          </Button>
                        </div>
                      </>
                    )}
                    {aaveFeature === AaveFeature.Borrow && (
                      <>
                        <UserReserveBalance
                          title={'Borrowed'}
                          userBalance={userReserve?.variableBorrows}
                          tokenPrice={marketPriceForToken}
                        />
                        <AmountInputWithPercentages
                          inputAmount={repayAmount}
                          setInputAmount={setRepayAmount}
                          baseAmount={userReserve?.variableBorrows}
                        />
                        <TransactionAmountSummary
                          tokenPrice={marketPriceForToken}
                          title={'Amount to repay'}
                          amount={repayAmount}
                        />
                        <div className={'flex flex-col mt-2'}>
                          <Button
                            onClick={handleRepay}
                            disabled={
                              transactionStarted ||
                              !userReserve ||
                              parseFloat(userReserve?.variableBorrows) === 0 ||
                              (repayAmount && userReserve?.variableBorrows
                                ? repayAmount > parseFloat(userReserve?.variableBorrows)
                                : false)
                            }
                            className={'flex-row-center justify-center'}
                          >
                            <span className={'ml-2'}>
                              {repaySubmitting ? 'Submitting...' : 'Repay'}
                            </span>
                          </Button>
                        </div>
                      </>
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
