import { useEffect, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import useWalletBalances from '_hooks/useWalletBalances';
import { ComputedReserveData, EthereumTransactionTypeExtended } from '@aave/protocol-js';
import { getGasPrice } from '_services/gasService';
import { runAaveActionTransaction, runAaveApprovalTransaction } from '_services/aaveService';
import { logTransactionHash } from '_services/dbService';
import { toggleBalancesAreStale } from '_redux/effects/walletEffects';
import { AppState } from '_redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { toggleUserSummaryStale } from '_redux/effects/aaveEffects';
import { setStep } from '_redux/effects/onboardingEffects';
import { EthereumTransactionError } from '_interfaces/errors';

export default function useHandleAaveFunction() {
  const network = useSelector((state: AppState) => state.web3.network);
  const provider = useSelector((state: AppState) => state.web3.provider);
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const [approvalTransactionHash, setApprovalTransactionHash] = useState<string | undefined>(
    undefined
  );
  const [tokenApproved, setTokenApproved] = useState<boolean>(false);
  const [actionTransactionHash, setActionTransactionHash] = useState<string | undefined>(undefined);
  const [transactionConfirmed, setTransactionConfirmed] = useState<boolean>(false);
  const [transactionInProgress, setTransactionInProgress] = useState<boolean>(false);
  const [transactionError, setTransactionError] = useState<string>('');
  const dispatch = useDispatch();

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

  const runAaveTransactions = async (
    provider: ethers.providers.Web3Provider,
    transactions: EthereumTransactionTypeExtended[]
  ) => {
    const approvalGas = await getGasPrice(network.gasStationUrl);
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
      await tx.wait(3);
    }
    setTokenApproved(true);
    const actionGas = await getGasPrice(network.gasStationUrl);
    const actionHash = await runAaveActionTransaction(transactions, provider, actionGas?.fastest);
    logTransactionHash(actionHash, network.chainId);
    setActionTransactionHash(actionHash);
    if (actionHash) {
      const tx = await provider.getTransaction(actionHash);
      await tx.wait(3);
    }
    setTransactionConfirmed(true);
    dispatch(toggleBalancesAreStale(true));
  };

  // TODOmake into hook
  const handleAaveFunction = async (
    reserve: ComputedReserveData,
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
        dispatch(toggleBalancesAreStale(true));
        if (nextStep) {
          dispatch(setStep(nextStep));
        }
      } catch (e: any) {
        console.error(e);
        const errorParsed = typeof e === 'string' ? (JSON.parse(e) as EthereumTransactionError) : e;
        setTransactionError(
          `${errorParsed.message}${errorParsed.data ? ' - ' + errorParsed.data.message : ''}`
        );
      }
      setFunctionSubmitting(false);
    }
  };
  return {
    handleAaveFunction,
    approvalTransactionHash,
    tokenApproved,
    actionTransactionHash,
    transactionConfirmed,
    transactionInProgress,
    transactionError,
    resetTransactionState
  };
}
