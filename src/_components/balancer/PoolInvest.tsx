import { Pool, PoolToken } from '_interfaces/balancer';
import useWalletBalances from '_hooks/useWalletBalances';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import React, { useEffect } from 'react';
import { CryptoCurrencySymbol } from '_enums/currency';
import { amountIsValidNumberGtZero } from '_utils/index';
import { BigNumber } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { getGasPrice } from '_services/gasService';
import { joinPool } from '_services/balancerPoolService';
import { toggleBalancesAreStale } from '_redux/effects/walletEffects';
import { toggleUserPoolDataStale } from '_redux/effects/balancerEffects';
import { EthereumTransactionError } from '_interfaces/errors';
import { TransactionStep } from '_components/transactions/TransactionStep';
import BlockExplorerLink from '_components/core/BlockExplorerLink';
import TransactionError from '_components/transactions/TransactionError';
import { BalancerFunction } from '_components/balancer/PoolFunctions';
import { setStep } from '_redux/effects/onboardingEffects';
import useBalancerFunctions from '_hooks/useBalancerFunctions';
import { BalancerActions, TransactionServices } from '_enums/db';
import { logTransaction } from '_services/dbService';
import BalancerPoolFunctionSummary from '_components/balancer/BalancerPoolFunctionSummary';
import PoolInvestForm from '_components/balancer/PoolInvestForm';

export default function PoolInvest({ pool }: { pool: Pool }) {
  const dispatch = useDispatch();
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const { provider, network, signer } = useSelector((state: AppState) => state.web3);
  const { complete, ongoing, currentStep } = useSelector((state: AppState) => state.onboarding);
  const walletBalances = useWalletBalances();
  const {
    sumAmounts,
    amounts: amountsToInvest,
    setAmounts: setAmountsToInvest,
    handleTokenAmountChange,
    checkApprovalsAndGetAmounts,
    transactionInProgress,
    setTransactionInProgress,
    transactionComplete,
    setTransactionComplete,
    transactionHash,
    setTransactionHash,
    transactionError,
    setTransactionError,
    setTokensApproved,
    tokensApproved,
    tokenApprovalHash,
    sumOfAmountsInFiat,
    setSumOfAmountsInFiat
  } = useBalancerFunctions();

  const initTokenAmounts = () => {
    setAmountsToInvest(Array(pool.tokens.length).fill('0.0'));
  };
  useEffect(() => {
    if (!amountsToInvest.length) {
      initTokenAmounts();
    }
  }, [pool]);

  const getUserBalanceForPoolToken = (token: PoolToken): BigNumber | undefined => {
    const bal = walletBalances[token.symbol as CryptoCurrencySymbol];
    return bal && bal.balance;
  };

  useEffect(() => {
    if (!amountsToInvest.length) {
      setSumOfAmountsInFiat('0.0');
    }
    const total = sumAmounts(pool.tokens);
    setSumOfAmountsInFiat(isNaN(total) ? null : total.toFixed(2));
  }, [amountsToInvest, pool.tokens, setSumOfAmountsInFiat, sumAmounts]);

  const join = async () => {
    if (userAddress && signer && amountsToInvest && provider && network) {
      try {
        setTransactionInProgress(true);
        const amountsIn = await checkApprovalsAndGetAmounts(pool.tokens);
        setTokensApproved(true);
        const gasResult = await getGasPrice(network.gasStationUrl);
        const tx = await joinPool(pool, userAddress, signer, amountsIn, gasResult?.fastest);
        setTransactionHash(tx.hash);
        logTransaction(
          tx.hash,
          network.chainId,
          TransactionServices.Balancer,
          BalancerActions.Invest
        );
        await tx.wait(3);
        setTransactionComplete(true);
        dispatch(toggleBalancesAreStale(true));
        dispatch(toggleUserPoolDataStale(true));
        initTokenAmounts();
        if (ongoing && !complete) {
          dispatch(setStep(currentStep + 1));
        }
      } catch (e: any) {
        console.error(e);
        // TODO move to hook
        const errorParsed = typeof e === 'string' ? (JSON.parse(e) as EthereumTransactionError) : e;
        setTransactionError(
          `${errorParsed.message}${errorParsed.data ? ' - ' + errorParsed.data.message : ''}`
        );
      }
    }
  };

  const stateValuesAreValid = (): boolean => {
    if (!amountsToInvest.length) {
      return false;
    }
    let nonZeroAmounts = 0;
    for (let i = 0; i < amountsToInvest.length; i++) {
      const amount = amountsToInvest[i];
      if (amountIsValidNumberGtZero(amount)) {
        nonZeroAmounts++;
        const amountBn = parseUnits(amount, pool.tokens[i].decimals);
        const walletBalance =
          walletBalances[pool.tokens[i].symbol.toUpperCase() as CryptoCurrencySymbol];
        if (walletBalance && amountBn.gt(walletBalance.balance)) {
          return false;
        }
      }
    }
    if (nonZeroAmounts === 0) {
      return false;
    }
    if (sumOfAmountsInFiat === null) {
      return false;
    }
    return true;
  };

  const resetState = () => {
    initTokenAmounts();
    setTransactionHash('');
    setTransactionInProgress(false);
    setTransactionComplete(false);
    setTransactionError('');
    setTokensApproved(false);
  };

  const handleMaxAmountPressed = () => {
    const newTokenAmounts = [...amountsToInvest];
    for (let i = 0; i < newTokenAmounts.length; i++) {
      const token = pool.tokens[i];
      const balance = getUserBalanceForPoolToken(token);
      newTokenAmounts[i] = balance ? formatUnits(balance.toString(), token.decimals) : '0';
    }
    setAmountsToInvest(newTokenAmounts);
  };
  return (
    <div className={'flex flex-col'}>
      <PoolInvestForm
        poolTokens={pool.tokens}
        handleTokenAmountChange={handleTokenAmountChange}
        amountsToInvest={amountsToInvest}
      />
      <BalancerPoolFunctionSummary
        sumOfAmountsInFiat={sumOfAmountsInFiat}
        handleMaxAmountPressed={handleMaxAmountPressed}
        functionName={BalancerFunction.Invest}
        buttonDisabled={transactionInProgress || !stateValuesAreValid()}
        onClick={join}
      />
      <div className={'text-body px-2 my-2'}>
        {(transactionInProgress || transactionComplete) && (
          <div>
            <TransactionStep
              show={true}
              transactionError={transactionError}
              stepComplete={tokensApproved}
            >
              {tokensApproved ? 'Tokens approved' : 'Approving tokens'}
              <BlockExplorerLink transactionHash={tokenApprovalHash} />
            </TransactionStep>
            <TransactionStep
              show={tokensApproved}
              transactionError={transactionError}
              stepComplete={transactionComplete}
              showTransition={false}
            >
              {transactionComplete ? 'Investment confirmed' : 'Investment confirming'}
              <BlockExplorerLink transactionHash={transactionHash} />
            </TransactionStep>
            <TransactionError onClickClear={resetState} transactionError={transactionError} />
          </div>
        )}
      </div>
    </div>
  );
}
