import AaveReserveFunctionContent from '_components/aave/AaveReserveFunctionContent';
import { HealthFactorImpact, HealthFactorResource } from '_enums/aave';
import { parseUnits } from 'ethers/lib/utils';
import React, { useEffect, useState } from 'react';
import {
  calculateMaxWithdrawAmount,
  getBorrowTransactions,
  getDepositTransactions,
  getRepayTransactions,
  getWithdrawTransactions
} from '_services/aaveService';
import { AaveActions } from '_enums/db';
import { stepBorrowAave, stepDepositAave } from '_pages/Onboarding/OnboardingSteps';
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import useHandleAaveFunction from '_hooks/useHandleAaveFunction';
import { ComputedReserveData } from '@aave/protocol-js';
import useWalletBalances from '_hooks/useWalletBalances';
import { BigNumber } from 'ethers';
import { CryptoCurrencySymbol } from '_enums/currency';
import { EvmTokenDefinition } from '_enums/tokens';
import NextHealthFactor from '_components/aave/healthfactor/NextHealthFactor';
import SingleCryptoAmountInput from '_components/core/SingleCryptoAmountInput';
import { ComputedUserReserve } from '@aave/protocol-js/dist/v2/types';
import useAaveReserves from '_hooks/useAaveReserves';
import useAaveUserSummary from '_hooks/useAaveUserSummary';

export default function AaveReserveFunctionRepay({
  reserve,
  token,
  transactionInProgress
}: {
  reserve: ComputedReserveData;
  token: EvmTokenDefinition;
  transactionInProgress: boolean;
}) {
  const { provider } = useSelector((state: AppState) => state.web3);
  const [userReserve, setUserReserve] = useState<ComputedUserReserve | undefined>();
  const [maxRepayAmount, setMaxRepayAmount] = useState<BigNumber | undefined>();
  const { handleAaveFunction, amount, handleSetAmount, isSubmitting } = useHandleAaveFunction();
  const aaveReserves = useAaveReserves();
  const userSummary = useAaveUserSummary();
  const walletBalances = useWalletBalances();
  const [userBalance, setUserBalance] = useState<BigNumber | undefined>();
  useEffect(() => {
    if (token) {
      setUserBalance(walletBalances[token.symbol]?.balance);
    }
  }, [walletBalances, token]);

  useEffect(() => {
    if (userSummary) {
      const ur = userSummary.reservesData.find(
        (ur) => ur.reserve.symbol.toLowerCase() === reserve.symbol.toLowerCase()
      );
      if (ur) {
        setUserReserve(ur);
      }
    }
  }, [aaveReserves, reserve.symbol, userSummary]);

  useEffect(() => {
    if (userReserve) {
      setMaxRepayAmount(parseUnits(userReserve.variableBorrows, token.decimals));
    } else {
      setMaxRepayAmount(BigNumber.from(0));
    }
  }, [token.decimals, userReserve]);

  const handleRepay = async () => {
    if (amount && provider) {
      await handleAaveFunction(reserve.underlyingAsset, getRepayTransactions, AaveActions.Repay);
    }
  };

  const balanceLessThanRepayAmount = (): boolean => {
    if (!amount || !userBalance) {
      return false;
    }
    return userBalance.lt(parseUnits(amount, reserve.decimals));
  };

  const repayAmountGreaterThanBorrowed = (): boolean => {
    if (!amount || !userReserve || !userReserve.variableBorrows) {
      return false;
    }
    return parseFloat(amount) > parseFloat(userReserve?.variableBorrows);
  };

  const getButtonText = (): string => {
    if (isSubmitting) {
      return 'Submitting...';
    }
    if (balanceLessThanRepayAmount()) {
      return 'Insufficient funds';
    }
    return 'Repay';
  };

  const buttonIsDisabled = (): boolean => {
    return (
      transactionInProgress ||
      !userReserve ||
      !amount ||
      parseFloat(userReserve.variableBorrows) === 0 ||
      balanceLessThanRepayAmount() ||
      repayAmountGreaterThanBorrowed()
    );
  };
  return (
    <>
      <AaveReserveFunctionContent
        renderNextHealthFactor={() => (
          <NextHealthFactor
            reserve={reserve}
            amount={amount}
            healthFactorResource={HealthFactorResource.Borrows}
            healthFactorImpact={HealthFactorImpact.Increase}
          />
        )}
        renderAmountInput={() => (
          <SingleCryptoAmountInput
            disabled={false}
            amount={amount}
            balance={maxRepayAmount}
            amountChanged={handleSetAmount}
            token={token}
          />
        )}
        buttonText={getButtonText()}
        userBalance={maxRepayAmount}
        token={token}
        buttonOnClick={handleRepay}
        buttonDisabled={buttonIsDisabled()}
      />
    </>
  );
}
