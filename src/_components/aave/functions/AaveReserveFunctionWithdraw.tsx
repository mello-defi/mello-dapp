import AaveReserveFunctionContent from '_components/aave/AaveReserveFunctionContent';
import { HealthFactorImpact, HealthFactorResource } from '_enums/aave';
import { parseUnits } from 'ethers/lib/utils';
import React, { useEffect, useState } from 'react';
import { calculateMaxWithdrawAmount, getWithdrawTransactions } from '_services/aaveService';
import { AaveActions } from '_enums/db';
import { stepDepositAave } from '_pages/Onboarding/OnboardingSteps';
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import useHandleAaveFunction from '_hooks/useHandleAaveFunction';
import { ComputedReserveData } from '@aave/protocol-js';
import useWalletBalances from '_hooks/useWalletBalances';
import { BigNumber } from 'ethers';
import { EvmTokenDefinition } from '_enums/tokens';
import NextHealthFactor from '_components/aave/healthfactor/NextHealthFactor';
import SingleCryptoAmountInput from '_components/core/SingleCryptoAmountInput';
import { ComputedUserReserve } from '@aave/protocol-js/dist/v2/types';
import useAaveReserves from '_hooks/useAaveReserves';
import useAaveUserSummary from '_hooks/useAaveUserSummary';

export default function AaveReserveFunctionWithdraw({
  reserve,
  token,
  transactionInProgress
}: {
  reserve: ComputedReserveData;
  token: EvmTokenDefinition;
  transactionInProgress: boolean;
}) {
  const provider = useSelector((state: AppState) => state.web3.provider);
  const [userReserve, setUserReserve] = useState<ComputedUserReserve | undefined>();
  const [maxWithdrawAmount, setMaxWithdrawAmount] = useState<BigNumber | undefined>();
  const walletBalances = useWalletBalances();
  const { handleAaveFunction, amount, handleSetAmount, isSubmitting } = useHandleAaveFunction();
  const aaveReserves = useAaveReserves();
  const userSummary = useAaveUserSummary();
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
    if (userReserve && userSummary) {
      setMaxWithdrawAmount(calculateMaxWithdrawAmount(userSummary, userReserve, reserve));
    } else {
      setMaxWithdrawAmount(BigNumber.from('0'));
    }
  }, [reserve, reserve.symbol, userReserve, userSummary, walletBalances]);

  const handleWithdraw = async () => {
    if (amount && provider) {
      await handleAaveFunction(
        reserve.underlyingAsset,
        getWithdrawTransactions,
        AaveActions.Withdraw
      );
    }
  };

  const isWithdrawingMoreThanBalance = (): boolean => {
    if (!amount || !userReserve || !userReserve.underlyingBalance) {
      return false;
    }
    return parseFloat(amount) > parseFloat(userReserve.underlyingBalance);
  };

  const isTooCloseToLiquidation = (): boolean => {
    if (!userReserve || !userSummary || !amount) {
      return false;
    }
    return calculateMaxWithdrawAmount(userSummary, userReserve, reserve).lt(
      parseUnits(amount, reserve.decimals)
    );
  };

  const getButtonText = (): string => {
    if (isSubmitting) {
      return 'Submitting...';
    }
    if (isWithdrawingMoreThanBalance()) {
      return 'Insufficient funds';
    }
    if (isTooCloseToLiquidation()) {
      return 'Liquidation risk too high';
    }
    return 'Withdraw';
  };

  const buttonIsDisabled = (): boolean => {
    return (
      transactionInProgress ||
      !userReserve ||
      !userSummary ||
      !amount ||
      parseFloat(amount) === 0 ||
      parseFloat(userReserve.underlyingBalance) === 0 ||
      isWithdrawingMoreThanBalance() ||
      isTooCloseToLiquidation()
    );
  };
  return (
    <>
      <AaveReserveFunctionContent
        renderNextHealthFactor={() => (
          <NextHealthFactor
            reserve={reserve}
            amount={amount}
            healthFactorImpact={HealthFactorImpact.Decrease}
            healthFactorResource={HealthFactorResource.Collateral}
          />
        )}
        renderAmountInput={() => (
          <SingleCryptoAmountInput
            disabled={false}
            amount={amount}
            balance={maxWithdrawAmount}
            amountChanged={handleSetAmount}
            token={token}
          />
        )}
        buttonText={getButtonText()}
        userBalance={maxWithdrawAmount}
        token={token}
        buttonOnClick={handleWithdraw}
        buttonDisabled={buttonIsDisabled()}
      />
    </>
  );
}
