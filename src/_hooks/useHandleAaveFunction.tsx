import { useState } from 'react';
import { ethers } from 'ethers';
import { EthereumTransactionTypeExtended } from '@aave/protocol-js';
import { getGasPrice } from '_services/gasService';
import { runAaveActionTransaction, runAaveApprovalTransaction } from '_services/aaveService';
import { toggleBalancesAreStale } from '_redux/effects/walletEffects';
import { AppState } from '_redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { toggleUserSummaryStale } from '_redux/effects/aaveEffects';
import { setStep } from '_redux/effects/onboardingEffects';
import { EthereumTransactionError } from '_interfaces/errors';
import { AaveActions, GenericActions, TransactionServices } from '_enums/db';
import { logTransaction } from '_services/dbService';

export default function useHandleAaveFunction() {
  const { provider, network } = useSelector((state: AppState) => state.web3);
  const { complete, ongoing } = useSelector((state: AppState) => state.onboarding);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState('0.0');
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

  const handleSetAmount = (amount: string) => {
    setAmount(amount);
    resetTransactionState();
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

  const runAaveTransactions = async (
    provider: ethers.providers.Web3Provider,
    transactions: EthereumTransactionTypeExtended[],
    action: AaveActions
  ) => {
    const approvalGas = await getGasPrice(network.gasStationUrl);
    const approvalHash = await runAaveApprovalTransaction(
      transactions,
      provider,
      approvalGas?.fastest
    );
    if (approvalHash) {
      const tx = await provider.getTransaction(approvalHash);
      logTransaction(
        approvalHash,
        network.chainId,
        TransactionServices.Aave,
        GenericActions.Approve
      );
      setApprovalTransactionHash(approvalHash);
      await tx.wait(3);
    }
    setTokenApproved(true);
    const actionGas = await getGasPrice(network.gasStationUrl);
    const actionHash = await runAaveActionTransaction(transactions, provider, actionGas?.fastest);
    logTransaction(actionHash, network.chainId, TransactionServices.Aave, action);
    setActionTransactionHash(actionHash);
    if (actionHash) {
      const tx = await provider.getTransaction(actionHash);
      await tx.wait(3);
    }
    setTransactionConfirmed(true);
    dispatch(toggleBalancesAreStale(true));
  };

  const handleAaveFunction = async (
    reserveUnderlyingAssetAddress: string,
    getTransactions: (
      provider: ethers.providers.Web3Provider,
      userAddress: string,
      underlyingAsset: string,
      amount: string
    ) => Promise<EthereumTransactionTypeExtended[]>,
    action: AaveActions,
    nextStep?: number | null
  ) => {
    if (provider && userAddress && reserveUnderlyingAssetAddress) {
      try {
        setTransactionInProgress(true);
        setIsSubmitting(true);
        const transactions: EthereumTransactionTypeExtended[] = await getTransactions(
          provider,
          userAddress,
          reserveUnderlyingAssetAddress,
          amount
        );
        await runAaveTransactions(provider, transactions, action);
        setAmount('0.0');
        setTransactionInProgress(false);
        dispatch(toggleUserSummaryStale(true));
        dispatch(toggleBalancesAreStale(true));
        // TODO decouple from component
        if (nextStep && ongoing && !complete) {
          dispatch(setStep(nextStep));
        }
      } catch (e: any) {
        console.error(e);
        const errorParsed = typeof e === 'string' ? (JSON.parse(e) as EthereumTransactionError) : e;
        setTransactionError(
          `${errorParsed.message}${errorParsed.data ? ' - ' + errorParsed.data.message : ''}`
        );
      }
      setIsSubmitting(false);
    }
  };
  return {
    handleAaveFunction,
    handleSetAmount,
    amount,
    setAmount,
    isSubmitting,
    setIsSubmitting,
    approvalTransactionHash,
    tokenApproved,
    actionTransactionHash,
    transactionConfirmed,
    transactionInProgress,
    transactionError,
    resetTransactionState
  };
}
