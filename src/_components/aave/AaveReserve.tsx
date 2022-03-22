import React, { useEffect, useState } from 'react';
import { ComputedReserveData, EthereumTransactionTypeExtended } from '@aave/protocol-js';
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
  calculateMaxWithdrawAmount,
  getBorrowTransactions,
  getDepositTransactions,
  getRepayTransactions,
  getWithdrawTransactions,
  runAaveActionTransaction,
  runAaveApprovalTransaction
} from '_services/aaveService';
import { getBalanceForToken, toggleBalanceIsStale } from '_redux/effects/walletEffects';
import useWalletBalance from '_hooks/useWalletBalance';
import { EvmTokenDefinition } from '_enums/tokens';
import useMarketPrices from '_hooks/useMarketPrices';
import { HorizontalLineBreak } from '_components/core/HorizontalLineBreak';
import { AaveFunction, AaveSection, HealthFactorImpact, HealthFactorResource } from '_enums/aave';
import AaveFunctionButton from '_components/aave/AaveFunctionButton';
import AaveFunctionContent from '_components/aave/AaveFunctionContent';
import { EthereumTransactionError } from '_interfaces/errors';
import { toggleUserSummaryStale } from '_redux/effects/aaveEffects';
import { findTokenByAddress } from '_utils/index';
import { setStep } from '_redux/effects/onboardingEffects';
import useAaveReserves from '_hooks/useAaveReserves';
import useAaveUserSummary from '_hooks/useAaveUserSummary';
import { CryptoCurrencySymbol } from '_enums/currency';
import { convertCryptoAmounts } from '_services/priceService';
import { getGasPrice } from '_services/gasService';
import { getMarketDataForSymbol } from '_services/marketDataService';
import { logTransactionHash } from '_services/dbService';
import { OnboardingStep, stepBorrowAave, stepDepositAave } from '_pages/onboarding/OnboardingSteps';

// REVIEW huge refactor needed, too big
export default function AaveReserve({
  reserveSymbol,
  aaveSection
}: {
  reserveSymbol: string;
  aaveSection: AaveSection;
}) {
  const dispatch = useDispatch();
  const aaveReserves = useAaveReserves();
  const userSummary = useAaveUserSummary();
  const provider = useSelector((state: AppState) => state.web3.provider);
  // const userSummaryStale = useSelector((state: AppState) => state.aave.userSummaryStale);
  // const userAddress = useSelector((state: AppState) => state.wallet.ad);
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const tokenSet = useSelector((state: AppState) => state.web3.tokenSet);
  const network = useSelector((state: AppState) => state.web3.network);
  // REVIEW - centralise this
  const gasStationUrl = useSelector((state: AppState) => state.web3.network.gasStationUrl);
  const marketPrices = useMarketPrices();
  const [reserve, setReserve] = useState<ComputedReserveData | undefined>();
  const [userReserve, setUserReserve] = useState<ComputedUserReserve | undefined>();
  const [marketPriceForToken, setMarketPriceForToken] = useState<number | undefined>(undefined);
  const [depositAmount, setDepositAmount] = useState<string>('0.0');
  const [borrowAmount, setBorrowAmount] = useState<string>('0.0');
  const [repayAmount, setRepayAmount] = useState<string>('0.0');
  const [borrowSubmitting, setBorrowSubmitting] = useState(false);
  const [repaySubmitting, setRepaySubmitting] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('0.0');
  const [depositSubmitting, setDepositSubmitting] = useState<boolean>(false);
  const [withdrawSubmitting, setWithdrawSubmitting] = useState<boolean>(false);
  const [tokenApproved, setTokenApproved] = useState<boolean>(false);
  const [approvalTransactionHash, setApprovalTransactionHash] = useState<string>('');
  const [actionTransactionHash, setActionTransactionHash] = useState<string>();
  const [transactionInProgress, setTransactionInProgress] = useState<boolean>(false);
  const [transactionError, setTransactionError] = useState<string>('');
  const [transactionConfirmed, setTransactionConfirmed] = useState<boolean>(false);
  const [maxBorrowAmount, setMaxBorrowAmount] = useState<string>('');
  const [aaveFunction, setAaveFunction] = useState<AaveFunction | null>(null);
  const [token, setToken] = useState<EvmTokenDefinition | undefined>();
  // console.log('token', token);
  const userBalance = useWalletBalance(token);

  useEffect(() => {
    if (!token) {
      setToken(
        Object.values(tokenSet).find((t) => t.symbol.toLowerCase() === reserveSymbol.toLowerCase())
      );
    }
  }, [tokenSet]);
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
  useEffect(() => {
    if (userSummary && reserve && marketPrices) {
      const ethMarketData = getMarketDataForSymbol(marketPrices, CryptoCurrencySymbol.ETH);
      const tokenMarketData = getMarketDataForSymbol(marketPrices, reserve.symbol);
      if (ethMarketData && tokenMarketData) {
        setMaxBorrowAmount(
          convertCryptoAmounts(
            userSummary.availableBorrowsETH,
            ethMarketData.current_price,
            tokenMarketData.current_price
          ).toFixed(6)
        );
      }
    }
  }, [userSummary, reserve, marketPrices]);
  useEffect(() => {
    if (token && marketPrices) {
      const marketPrice = getMarketDataForSymbol(marketPrices, token.symbol);
      if (marketPrice) {
        setMarketPriceForToken(marketPrice.current_price);
      }
    }
  }, [token, marketPrices]);

  const runAaveTransactions = async (
    provider: ethers.providers.Web3Provider,
    transactions: EthereumTransactionTypeExtended[]
  ) => {
    const approvalGas = await getGasPrice(gasStationUrl);
    const approvalHash = await runAaveApprovalTransaction(
      transactions,
      provider,
      approvalGas?.fastest
    );
    // const address =
    if (approvalHash) {
      const tx = await provider.getTransaction(approvalHash);
      logTransactionHash(approvalHash, network.chainId);
      setApprovalTransactionHash(approvalHash);
      await tx.wait(approvalGas?.blockTime || 3);
    }
    setTokenApproved(true);
    const actionGas = await getGasPrice(gasStationUrl);
    const actionHash = await runAaveActionTransaction(transactions, provider, actionGas?.fastest);
    logTransactionHash(actionHash, network.chainId);
    setActionTransactionHash(actionHash);
    if (actionHash) {
      const tx = await provider.getTransaction(actionHash);
      await tx.wait(actionGas?.blockTime || 3);
    }
    setTransactionConfirmed(true);

    if (token && userAddress) {
      dispatch(getBalanceForToken(token, provider, userAddress, true));
    }
  };

  const handleAaveFunction = async (
    amount: string,
    setAmount: (amount: string) => void,
    setFunctionSubmitting: (value: boolean) => void,
    getTransactions: (
      provider: ethers.providers.Web3Provider,
      userAddress: string,
      underlyingAsset: string,
      amount: string
    ) => Promise<EthereumTransactionTypeExtended[]>,
    nextStep?: number | null
  ) => {
    if (provider && userAddress && reserve) {
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
        dispatch(toggleUserSummaryStale(true));
        dispatch(
          toggleBalanceIsStale(findTokenByAddress(tokenSet, reserve.underlyingAsset).symbol, true)
        );
        if (nextStep) {
          dispatch(setStep(nextStep));
        }
      } catch (e: any) {
        const errorParsed = typeof e === 'string' ? (JSON.parse(e) as EthereumTransactionError) : e;
        setTransactionError(
          `${errorParsed.message}${errorParsed.data ? ' - ' + errorParsed.data.message : ''}`
        );
      }
      setFunctionSubmitting(false);
    }
  };

  // REVIEW all methods almost identical
  const handleBorrow = async () => {
    if (borrowAmount && provider && userAddress) {
      await handleAaveFunction(
        borrowAmount,
        setBorrowAmount,
        setBorrowSubmitting,
        getBorrowTransactions,
        stepBorrowAave.nextStep?.number
      );
    }
  };

  const handleRepay = async () => {
    if (repayAmount && provider && userAddress && userReserve && token) {
      await handleAaveFunction(
        userReserve.variableBorrows === repayAmount ? '-1' : repayAmount,
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
        getDepositTransactions,
        stepDepositAave.nextStep?.number,
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

  const setAmount = (amount: string, setStateFunction: (amount: string) => void) => {
    setStateFunction(amount);
    resetTransactionState();
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

  return (
    <>
      {marketPrices && reserve && (
        <div
          className={'bg-white rounded-2xl px-4 py-4 mb-2 border-2 -mx-1 border-gray-50 shadow-sm'}
        >
          <div className={'flex-row-center justify-between'}>
            <AaveReserveMarketData reserve={reserve} aaveSection={aaveSection} />
            {aaveSection === AaveSection.Borrow && (
              <div className={'flex flex-col md:flex-row items-center'}>
                <AaveFunctionButton
                  activeFunctionName={aaveFunction}
                  handleClicked={handleFunctionButtonClicked}
                  functionName={AaveFunction.Borrow}
                  disabled={
                    (userSummary && parseFloat(userSummary.availableBorrowsETH) <= 0) ||
                    (transactionInProgress && !transactionError)
                  }
                />
                <AaveFunctionButton
                  activeFunctionName={aaveFunction}
                  handleClicked={handleFunctionButtonClicked}
                  functionName={AaveFunction.Repay}
                  disabled={
                    !userReserve ||
                    parseFloat(userReserve.variableBorrows) === 0 ||
                    (transactionInProgress && !transactionError)
                  }
                />
              </div>
            )}
            {aaveSection === AaveSection.Deposit && (
              <div className={'flex flex-col md:flex-row items-center'}>
                <AaveFunctionButton
                  activeFunctionName={aaveFunction}
                  handleClicked={handleFunctionButtonClicked}
                  functionName={AaveFunction.Deposit}
                  disabled={
                    !userBalance ||
                    userBalance.isZero() ||
                    (transactionInProgress && !transactionError)
                  }
                />
                <AaveFunctionButton
                  activeFunctionName={aaveFunction}
                  handleClicked={handleFunctionButtonClicked}
                  functionName={AaveFunction.Withdraw}
                  disabled={
                    !userReserve ||
                    parseFloat(userReserve.underlyingBalance) === 0 ||
                    (transactionInProgress && !transactionError)
                  }
                />
              </div>
            )}
          </div>
          <DefaultTransition isOpen={aaveFunction !== null}>
            <div>
              <HorizontalLineBreak />
              {marketPriceForToken && reserve && token && (
                <div className={'flex flex-col md:flex-row justify-between space-x-0 sm:space-x-2'}>
                  <div className={'flex flex-col w-full'}>
                    {aaveFunction === AaveFunction.Deposit && (
                      <AaveFunctionContent
                        healthFactorImpact={HealthFactorImpact.Increase}
                        healthFactorResource={HealthFactorResource.Collateral}
                        reserveTitle={'Wallet'}
                        reserve={reserve}
                        summaryTitle={'Amount to deposit'}
                        userBalance={userBalance}
                        tokenPrice={marketPriceForToken}
                        amount={depositAmount}
                        setAmount={(amount: string) => setAmount(amount, setDepositAmount)}
                        token={token}
                        buttonOnClick={handleDeposit}
                        buttonDisabled={
                          !userBalance ||
                          userBalance.isZero() ||
                          !depositAmount ||
                          parseFloat(depositAmount) === 0 ||
                          transactionInProgress ||
                          (depositAmount
                            ? userBalance.lt(ethers.utils.parseUnits(depositAmount, token.decimals))
                            : true)
                        }
                      >
                        <span>
                          {depositSubmitting
                            ? 'Submitting...'
                            : (depositAmount &&
                                userBalance &&
                                userBalance.lt(
                                  ethers.utils.parseUnits(depositAmount, token.decimals)
                                )) ||
                              false
                            ? 'Insufficient balance'
                            : 'Deposit'}
                        </span>
                      </AaveFunctionContent>
                    )}
                    {aaveFunction === AaveFunction.Withdraw && (
                      <AaveFunctionContent
                        healthFactorImpact={HealthFactorImpact.Decrease}
                        healthFactorResource={HealthFactorResource.Collateral}
                        reserveTitle={'Max withdraw'}
                        summaryTitle={'Amount to withdraw'}
                        reserve={reserve}
                        userBalance={
                          userReserve && userSummary
                            ? calculateMaxWithdrawAmount(userSummary, userReserve, reserve)
                            : BigNumber.from('0')
                        }
                        tokenPrice={marketPriceForToken}
                        amount={withdrawAmount}
                        setAmount={(amount: string) => setAmount(amount, setWithdrawAmount)}
                        token={token}
                        buttonOnClick={handleWithdraw}
                        buttonDisabled={
                          transactionInProgress ||
                          !userReserve ||
                          !userSummary ||
                          !withdrawAmount ||
                          parseFloat(withdrawAmount) === 0 ||
                          parseFloat(userReserve.underlyingBalance) === 0 ||
                          (withdrawAmount && userReserve?.underlyingBalance
                            ? parseFloat(withdrawAmount) >
                                parseFloat(userReserve.underlyingBalance) ||
                              (withdrawAmount !== '' &&
                                calculateMaxWithdrawAmount(userSummary, userReserve, reserve).lt(
                                  ethers.utils.parseUnits(withdrawAmount, reserve.decimals)
                                ))
                            : false)
                        }
                      >
                        <span className={'ml-2'}>
                          {withdrawSubmitting
                            ? 'Submitting...'
                            : (withdrawAmount &&
                                userReserve?.underlyingBalance &&
                                parseFloat(withdrawAmount) >
                                  parseFloat(userReserve.underlyingBalance)) ||
                              false
                            ? 'Insufficient funds'
                            : userSummary &&
                              userReserve &&
                              withdrawAmount !== '' &&
                              calculateMaxWithdrawAmount(userSummary, userReserve, reserve).lt(
                                ethers.utils.parseUnits(withdrawAmount, reserve.decimals)
                              )
                            ? 'Liquidation risk too high'
                            : 'Withdraw'}
                        </span>
                      </AaveFunctionContent>
                    )}
                    {aaveFunction === AaveFunction.Borrow && (
                      <AaveFunctionContent
                        reserveTitle={'Borrowing power'}
                        healthFactorResource={HealthFactorResource.Borrows}
                        healthFactorImpact={HealthFactorImpact.Decrease}
                        summaryTitle={'Amount to borrow'}
                        reserve={reserve}
                        userBalance={
                          maxBorrowAmount
                            ? ethers.utils.parseUnits(maxBorrowAmount, token.decimals)
                            : BigNumber.from('0')
                        }
                        tokenPrice={marketPriceForToken}
                        amount={borrowAmount}
                        setAmount={(amount: string) => setAmount(amount, setBorrowAmount)}
                        token={token}
                        buttonOnClick={handleBorrow}
                        buttonDisabled={
                          transactionInProgress ||
                          !borrowAmount ||
                          parseFloat(borrowAmount) === 0 ||
                          !borrowAmount ||
                          (maxBorrowAmount !== '' &&
                            ethers.utils
                              .parseUnits(maxBorrowAmount, token.decimals)
                              .lt(ethers.utils.parseUnits(borrowAmount, token.decimals)))
                        }
                      >
                        <span className={'ml-2'}>
                          {borrowSubmitting
                            ? 'Submitting...'
                            : (maxBorrowAmount !== '' &&
                                ethers.utils
                                  .parseUnits(maxBorrowAmount, token.decimals)
                                  .lt(ethers.utils.parseUnits(borrowAmount, token.decimals))) ||
                              false
                            ? 'Insufficient collateral'
                            : 'Borrow'}
                        </span>
                      </AaveFunctionContent>
                    )}
                    {aaveFunction === AaveFunction.Repay && (
                      <AaveFunctionContent
                        reserveTitle={'Borrowed'}
                        healthFactorImpact={HealthFactorImpact.Increase}
                        healthFactorResource={HealthFactorResource.Borrows}
                        summaryTitle={'Amount to repay'}
                        userBalance={
                          userReserve
                            ? ethers.utils.parseUnits(userReserve.variableBorrows, token.decimals)
                            : BigNumber.from('0')
                        }
                        tokenPrice={marketPriceForToken}
                        amount={repayAmount}
                        reserve={reserve}
                        setAmount={(amount: string) => setAmount(amount, setRepayAmount)}
                        token={token}
                        buttonOnClick={handleRepay}
                        buttonDisabled={
                          transactionInProgress ||
                          !userReserve ||
                          !repayAmount ||
                          parseFloat(repayAmount) === 0 ||
                          parseFloat(userReserve?.variableBorrows) === 0 ||
                          (repayAmount && userReserve?.variableBorrows
                            ? parseFloat(repayAmount) > parseFloat(userReserve?.variableBorrows)
                            : false) ||
                          (repayAmount &&
                            userBalance &&
                            userBalance.lt(
                              ethers.utils.parseUnits(repayAmount, reserve.decimals)
                            )) ||
                          false
                        }
                      >
                        <span className={'ml-2'}>
                          {repaySubmitting
                            ? 'Submitting...'
                            : (repayAmount &&
                                userBalance &&
                                userBalance.lt(
                                  ethers.utils.parseUnits(repayAmount, reserve.decimals)
                                )) ||
                              false
                            ? 'Insufficient balance'
                            : 'Repay'}
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
