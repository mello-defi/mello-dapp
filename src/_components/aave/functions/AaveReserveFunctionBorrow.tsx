import AaveReserveFunctionContent from '_components/aave/AaveReserveFunctionContent';
import { HealthFactorImpact, HealthFactorResource } from '_enums/aave';
import { parseUnits } from 'ethers/lib/utils';
import React, { useEffect, useState } from 'react';
import { getBorrowTransactions } from '_services/aaveService';
import { AaveActions } from '_enums/db';
import { stepBorrowAave } from '_pages/Onboarding/OnboardingSteps';
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import useHandleAaveFunction from '_hooks/useHandleAaveFunction';
import { ComputedReserveData } from '@aave/protocol-js';
import { BigNumber } from 'ethers';
import { CryptoCurrencySymbol } from '_enums/currency';
import { EvmTokenDefinition } from '_enums/tokens';
import NextHealthFactor from '_components/aave/healthfactor/NextHealthFactor';
import SingleCryptoAmountInput from '_components/core/SingleCryptoAmountInput';
import useAaveUserSummary from '_hooks/useAaveUserSummary';
import { convertCryptoAmounts } from '_services/priceService';
import useMarketPrices from '_hooks/useMarketPrices';
import { TransactionStateProps } from '_hooks/useTransactionState';

export default function AaveReserveFunctionBorrow({
  reserve,
  token,
  transactionState
}: {
  reserve: ComputedReserveData;
  token: EvmTokenDefinition;
  transactionState: TransactionStateProps;
}) {
  const { provider, tokenSet } = useSelector((state: AppState) => state.web3);
  const marketPrices = useMarketPrices();
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const [maxBorrowAmount, setMaxBorrowAmount] = useState<BigNumber | undefined>();
  const { handleAaveFunction, amount, handleSetAmount, isSubmitting } =
    useHandleAaveFunction(transactionState);
  const userSummary = useAaveUserSummary();

  useEffect(() => {
    if (userSummary && reserve && marketPrices) {
      const ethAddress = tokenSet[CryptoCurrencySymbol.WETH]?.address;
      if (!ethAddress) {
        throw new Error('Could not get ETH price');
      }
      const ethMarketPrice = marketPrices[ethAddress.toLowerCase()];
      const tokenMarketPrice = marketPrices[reserve.underlyingAsset.toLowerCase()];
      if (ethMarketPrice && tokenMarketPrice) {
        const convertedAmount = convertCryptoAmounts(
          userSummary.availableBorrowsETH,
          ethMarketPrice,
          tokenMarketPrice
        ).toFixed(6);

        setMaxBorrowAmount(parseUnits(convertedAmount, reserve.decimals));
      }
    }
  }, [userSummary, reserve, marketPrices, tokenSet]);

  const handleBorrow = async () => {
    if (amount && provider && userAddress) {
      await handleAaveFunction(
        reserve.underlyingAsset,
        getBorrowTransactions,
        AaveActions.Borrow,
        stepBorrowAave.nextStep?.number
      );
    }
  };

  const borrowGreaterThanMaxAllowed = (): boolean => {
    return (
      amount !== '' &&
      maxBorrowAmount !== undefined &&
      maxBorrowAmount.lt(parseUnits(amount, token.decimals))
    );
  };

  const getButtonText = (): string => {
    if (isSubmitting) {
      return 'Submitting...';
    }
    if (borrowGreaterThanMaxAllowed()) {
      return 'Insufficient collateral';
    }
    return 'Borrow';
  };

  const buttonIsDisabled = (): boolean => {
    return (
      isSubmitting ||
      transactionState.transactionInProgress ||
      !amount ||
      borrowGreaterThanMaxAllowed()
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
            healthFactorImpact={HealthFactorImpact.Decrease}
          />
        )}
        renderAmountInput={() => (
          <SingleCryptoAmountInput
            disabled={false}
            amount={amount}
            balance={maxBorrowAmount}
            amountChanged={handleSetAmount}
            token={token}
            showMaxButton={false}
          />
        )}
        buttonText={getButtonText()}
        userBalance={maxBorrowAmount}
        token={token}
        buttonOnClick={handleBorrow}
        buttonDisabled={buttonIsDisabled()}
      />
    </>
  );
}
