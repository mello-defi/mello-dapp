import { useState } from 'react';

export interface TransactionStateProps {
  isSubmitting: boolean;
  setIsSubmitting: (isSubmitting: boolean) => void;
  approvalTransactionHash: string | undefined;
  setApprovalTransactionHash: (approvalTransactionHash: string) => void;
  tokenApproved: boolean;
  setTokenApproved: (tokenApproved: boolean) => void;
  actionTransactionHash: string | undefined;
  setActionTransactionHash: (actionTransactionHash: string) => void;
  transactionConfirmed: boolean;
  setTransactionConfirmed: (transactionConfirmed: boolean) => void;
  transactionError: string;
  setTransactionError: (transactionError: string) => void;
  transactionInProgress: boolean;
  setTransactionInProgress: (transactionInProgress: boolean) => void;
  resetTransactionState: () => void;
}
export default function useTransactionState(): TransactionStateProps {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [approvalTransactionHash, setApprovalTransactionHash] = useState<string | undefined>(
    undefined
  );
  const [tokenApproved, setTokenApproved] = useState<boolean>(false);
  const [actionTransactionHash, setActionTransactionHash] = useState<string | undefined>(undefined);
  const [transactionConfirmed, setTransactionConfirmed] = useState<boolean>(false);
  const [transactionInProgress, setTransactionInProgress] = useState<boolean>(false);
  const [transactionError, setTransactionError] = useState<string>('');

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

  return {
    setActionTransactionHash,
    setApprovalTransactionHash,
    setTokenApproved,
    setTransactionConfirmed,
    setTransactionError,
    setTransactionInProgress,
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
