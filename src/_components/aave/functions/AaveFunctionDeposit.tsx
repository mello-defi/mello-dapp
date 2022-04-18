import AaveFunctionContent from '_components/aave/AaveFunctionContent';
import { HealthFactorImpact, HealthFactorResource } from '_enums/aave';
import { parseUnits } from 'ethers/lib/utils';
import React, { useEffect, useState } from 'react';
import { getDepositTransactions } from '_services/aaveService';
import { AaveActions } from '_enums/db';
import { stepDepositAave } from '_pages/Onboarding/OnboardingSteps';
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import useHandleAaveFunction from '_hooks/useHandleAaveFunction';
import { ComputedReserveData } from '@aave/protocol-js';
import useWalletBalances from '_hooks/useWalletBalances';
import { BigNumber } from 'ethers';
import { CryptoCurrencySymbol } from '_enums/currency';
import { EvmTokenDefinition } from '_enums/tokens';
import NextHealthFactor from '_components/aave/NextHealthFactor';
import SingleCryptoAmountInput from '_components/core/SingleCryptoAmountInput';

export default function AaveFunctionDeposit({
  reserve,
  token,
  transactionInProgress
}: {
  reserve: ComputedReserveData;
  token: EvmTokenDefinition;
  transactionInProgress: boolean;
}) {
  const provider = useSelector((state: AppState) => state.web3.provider);
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const [userBalance, setUserBalance] = useState<BigNumber | undefined>();
  const walletBalances = useWalletBalances();
  const { handleAaveFunction, amount, handleSetAmount, isSubmitting } = useHandleAaveFunction();

  useEffect(() => {
    setUserBalance(walletBalances[reserve.symbol.toUpperCase() as CryptoCurrencySymbol]?.balance);
  }, [reserve.symbol, walletBalances]);

  const handleDeposit = async () => {
    if (amount && provider && userAddress) {
      await handleAaveFunction(
        reserve.underlyingAsset,
        getDepositTransactions,
        AaveActions.Deposit,
        stepDepositAave.nextStep?.number
      );
    }
  };

  const getButtonText = (): string => {
    if (isSubmitting) {
      return 'Submitting...';
    }
    if (amount && userBalance && userBalance.lt(parseUnits(amount, reserve.decimals))) {
      return 'Insufficient balance';
    }
    return 'Supply';
  };

  const buttonIsDisabled = (): boolean => {
    return (
      !userBalance ||
      userBalance.isZero() ||
      !amount ||
      parseFloat(amount) === 0 ||
      transactionInProgress ||
      (amount ? userBalance.lt(parseUnits(amount, token.decimals)) : true)
    );
  };
  return (
    <>
      <AaveFunctionContent
        renderNextHealthFactor={() => (
          <NextHealthFactor
            reserve={reserve}
            amount={amount}
            healthFactorImpact={HealthFactorImpact.Increase}
            healthFactorResource={HealthFactorResource.Collateral}
          />
        )}
        renderAmountInput={() => (
          <SingleCryptoAmountInput
            disabled={false}
            amount={amount}
            balance={userBalance}
            amountChanged={handleSetAmount}
            token={token}
          />
        )}
        buttonText={getButtonText()}
        userBalance={userBalance}
        token={token}
        buttonOnClick={handleDeposit}
        buttonDisabled={buttonIsDisabled()}
      />
    </>
  );
}
