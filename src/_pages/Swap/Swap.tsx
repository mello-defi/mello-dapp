import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import React, { useCallback, useEffect, useState } from 'react';
import { EvmTokenDefinition } from '_enums/tokens';
import { Button, ButtonSize, ButtonVariant } from '_components/core/Buttons';
import { OptimalRate } from 'paraswap-core';
import debounce from 'lodash/debounce';
import {
  buildSwapTransaction,
  getExchangeRate,
  getTokenTransferProxy,
  initialiseParaSwap
} from '_services/paraSwapService';
import { approveToken, executeEthTransaction, getTokenAllowance } from '_services/walletService';
import { TransactionStep } from '_components/transactions/TransactionStep';
import BlockExplorerLink from '_components/core/BlockExplorerLink';
import TransactionError from '_components/transactions/TransactionError';
import MultiCryptoAmountInput from '_components/core/MultiCryptoAmountInput';
import PoweredByLink from '_components/core/PoweredByLink';
import { paraswapLogo } from '_assets/images';
import { BigNumber, ethers } from 'ethers';
import { getGasPrice } from '_services/gasService';
import SwapPriceInformation from '_pages/Swap/SwapPriceInformation';
import useWalletBalances from '_hooks/useWalletBalances';
import { SwapVert } from '@mui/icons-material';
import { toggleBalancesAreStale } from '_redux/effects/walletEffects';
import { setStep } from '_redux/effects/onboardingEffects';
import { CryptoCurrencySymbol } from '_enums/currency';
import { logTransactionHash } from '_services/dbService';
import { stepPerformSwap } from '_pages/Onboarding/OnboardingSteps';
import { EthereumTransactionError } from '_interfaces/errors';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import SingleCryptoAmountInput from '_components/core/SingleCryptoAmountInput';

export default function Swap({
  initialSourceTokenSymbol,
  initialDestinationTokenSymbol
}: {
  initialSourceTokenSymbol?: CryptoCurrencySymbol;
  initialDestinationTokenSymbol?: CryptoCurrencySymbol;
}) {
  const dispatch = useDispatch();
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const { provider, network, signer, tokenSet } = useSelector((state: AppState) => state.web3);

  const [fetchingPriceError, setFetchingPriceError] = useState('');
  const [sourceToken, setSourceToken] = useState<EvmTokenDefinition>(
    (initialSourceTokenSymbol && tokenSet[initialSourceTokenSymbol]) || Object.values(tokenSet)[0]
  );
  const [sourceTokenBalance, setSourceTokenBalance] = useState<BigNumber | undefined>();
  const walletBalances = useWalletBalances();

  const [destinationToken, setDestinationToken] = useState<EvmTokenDefinition>(
    (initialDestinationTokenSymbol && tokenSet[initialDestinationTokenSymbol]) ||
      Object.values(tokenSet)[1]
  );
  useEffect(() => {
    if (sourceToken) {
      setSourceTokenBalance(walletBalances[sourceToken.symbol]?.balance);
    }
  }, [sourceToken, walletBalances]);
  const { complete, ongoing } = useSelector((state: AppState) => state.onboarding);

  console.log('sourceTokenBalance', sourceTokenBalance);
  const [sourceTokenDisabled, setSourceTokenDisabled] = useState<boolean>(false);
  const [destinationTokenDisabled, setDestinationTokenDisabled] = useState<boolean>(false);
  const [sourceAmount, setSourceAmount] = useState<string>('0.0');
  const [destinationAmount, setDestinationAmount] = useState<string>('0.0');
  const [sourceFiatAmount, setSourceFiatAmount] = useState<number>(0.0);
  const [destinationFiatAmount, setDestinationFiatAmount] = useState<number>(0.0);
  const [fetchingPrices, setFetchingPrices] = useState<boolean>(false);
  const [approvalTransactionHash, setApprovalTransactionHAsh] = useState<string>('');
  const [swapTransactionHash, setSwapTransactionHash] = useState<string>('');
  const [slippagePercentage, setSlippagePercentage] = useState<number>(1);
  const [transactionError, setTransactionError] = useState<string>('');
  const [priceRoute, setPriceRoute] = useState<OptimalRate>();
  const [isApproving, setIsApproving] = useState<boolean>(false);
  // TODO -- redux?
  if (provider) {
    initialiseParaSwap(provider, network.chainId);
  }
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [tokenIsApproved, setTokenIsApproved] = useState<boolean>(false);
  const [swapSubmitted, setSwapSubmitted] = useState<boolean>(false);
  const [swapConfirmed, setSwapConfirmed] = useState<boolean>(false);

  const resetTransactionSteps = () => {
    if (swapConfirmed) {
      setSwapConfirmed(false);
    }
    if (isSwapping) {
      setIsSwapping(false);
    }
    if (swapSubmitted) {
      setSwapSubmitted(false);
    }
    if (approvalTransactionHash) {
      setApprovalTransactionHAsh('');
    }
    if (swapTransactionHash) {
      setSwapTransactionHash('');
    }
    if (transactionError) {
      setTransactionError('');
    }
    if (fetchingPriceError) {
      setFetchingPriceError('');
    }
  };

  const updateExchangeRate = async (
    amount: string,
    srcToken: EvmTokenDefinition,
    destToken: EvmTokenDefinition
  ) => {
    if (destToken && amount && parseFloat(amount) > 0 && srcToken.symbol !== destToken.symbol) {
      resetTransactionSteps();
      setFetchingPriceError('');
      try {
        setDestinationTokenDisabled(true);
        setSourceTokenDisabled(true);
        setFetchingPrices(true);
        const srcAmount: BigNumber = parseUnits(amount, srcToken.decimals);
        const rate = await getExchangeRate(srcToken, destToken, srcAmount.toString());
        console.log('rate', rate);
        setPriceRoute(rate);
        setSourceFiatAmount(parseFloat(rate.srcUSD));
        setDestinationFiatAmount(parseFloat(rate.destUSD));
        setDestinationAmount(formatUnits(rate.destAmount, destToken.decimals));
        setSwapConfirmed(false);
      } catch (e: any) {
        console.error(e);
        setFetchingPriceError(e.message);
      }
      setFetchingPrices(false);
      setDestinationTokenDisabled(false);
      setSourceTokenDisabled(false);
    }
  };

  const checkAndApproveAllowance = async (
    provider: ethers.providers.Web3Provider,
    signer: ethers.Signer,
    userAddress: string
  ) => {
    const transferProxy = await getTokenTransferProxy();
    const allowance = await getTokenAllowance(
      sourceToken.address,
      sourceToken.abi,
      provider,
      userAddress,
      transferProxy
    );
    const amount: BigNumber = parseUnits(sourceAmount.toString(), sourceToken.decimals);
    if (amount.gt(allowance)) {
      const approvalGasResult = await getGasPrice(network.gasStationUrl);
      const approvalTxHash = await approveToken(
        sourceToken.address,
        sourceToken.abi,
        signer,
        userAddress,
        amount,
        approvalGasResult?.fastest,
        transferProxy
      );
      logTransactionHash(approvalTxHash.hash, network.chainId);
      setApprovalTransactionHAsh(approvalTxHash.hash);
      await approvalTxHash.wait(3);
    }
  };

  const handleSwap = async () => {
    if (provider && destinationToken && priceRoute && userAddress && signer) {
      try {
        setIsSwapping(true);
        if (!sourceToken.isGasToken) {
          await checkAndApproveAllowance(provider, signer, userAddress);
        }
        setTokenIsApproved(true);
        const actionGasResult = await getGasPrice(network.gasStationUrl);
        const tx = await buildSwapTransaction(
          sourceToken,
          destinationToken,
          userAddress,
          priceRoute,
          slippagePercentage,
          actionGasResult?.fastest
        );
        setSwapSubmitted(true);
        const swapTxHash = await executeEthTransaction(tx, provider);
        logTransactionHash(swapTxHash.hash, network.chainId);
        setSwapTransactionHash(swapTxHash.hash);
        await swapTxHash.wait(3);
        setSwapConfirmed(true);
        resetState();
        dispatch(toggleBalancesAreStale(true));
        if (ongoing && !complete) {
          dispatch(setStep(stepPerformSwap.number + 1));
        }
      } catch (e: any) {
        console.error(e);
        const errorParsed = typeof e === 'string' ? (JSON.parse(e) as EthereumTransactionError) : e;
        setTransactionError(
          `${errorParsed.message}${errorParsed.data ? ' - ' + errorParsed.data.message : ''}`
        );
      }
    }
  };

  const resetState = () => {
    setSourceAmount('0.0');
    setDestinationAmount('0.0');
    setSourceFiatAmount(0);
    setDestinationFiatAmount(0);
    setTransactionError('');
    setIsSwapping(false);
    setIsApproving(false);
  };

  // const debounceDestinationTokenChanged = useCallback(
  //   debounce(
  //     (amount, srcToken, nextValue) => updateExchangeRate(amount, srcToken, nextValue),
  //     750
  //   ),
  //   [] // will be created only once initially
  // );

  // const destinationTokenChanged = (token: EvmTokenDefinition) => {
  //   setDestinationToken(token);
  //   debounceDestinationTokenChanged(destinationAmount, sourceToken, token);
  // };
  const debounceSourceAmountChanged = useCallback(
    debounce(
      (nextValue, srcToken, destToken) => updateExchangeRate(nextValue, srcToken, destToken),
      750
    ),
    [] // will be created only once initially
  );

  const sourceAmountChanged = (amount: string) => {
    setSourceAmount(amount);
    debounceSourceAmountChanged(amount, sourceToken, destinationToken);
  };

  const swapSourceDestination = () => {
    const temp = destinationToken;
    setDestinationToken(sourceToken);
    setSourceToken(temp);
    const tempAmount = destinationAmount;
    setDestinationAmount(sourceAmount);
    setSourceAmount(tempAmount);
  };

  return (
    <div>
      <div className={'px-2 flex-row-center justify-between'}>
        <span className={'text-header'}>Swap</span>
        <PoweredByLink url={'https://paraswap.io'} logo={paraswapLogo} />
      </div>
      {/*{initialSourceTokenSymbol ? (*/}
      {/*  <SingleCryptoAmountInput*/}
      {/*    showMaxButton={false}*/}
      {/*    balance={sourceTokenBalance}*/}
      {/*    disabled={isSwapping || sourceTokenDisabled}*/}
      {/*    amount={sourceAmount}*/}
      {/*    amountChanged={sourceAmountChanged}*/}
      {/*    token={sourceToken}*/}
      {/*  />*/}
      {/*) : (*/}
        <MultiCryptoAmountInput
          token={sourceToken}
          tokenChanged={setSourceToken}
          amount={sourceAmount}
          amountChanged={sourceAmountChanged}
          disabled={isSwapping || sourceTokenDisabled}
          allowAmountOverMax={false}
        />
      {/*)}*/}
      <div
        className={
          'flex flex-row mx-auto items-center w-20 justify-center rounded-2xl -my-6 py-2 z-50'
        }
      >
        <div>
          <Button
            size={ButtonSize.SMALL}
            onClick={swapSourceDestination}
            className={'z-20 opacity-95 bg-gray-400 rounded-full p-2 mt-2'}
          >
            <SwapVert className={'h-4 w-4'} />
          </Button>
        </div>
      </div>
      <MultiCryptoAmountInput
        token={destinationToken}
        tokenChanged={setDestinationToken}
        // tokenChanged={destinationTokenChanged}
        amount={destinationAmount}
        amountChanged={setDestinationAmount}
        disabled={isSwapping || destinationTokenDisabled}
      />
      <TransactionError transactionError={fetchingPriceError} />
      <SwapPriceInformation
        setSlippagePercentage={setSlippagePercentage}
        fetchingPrices={fetchingPrices}
        destinationToken={destinationToken}
        priceRoute={priceRoute}
        sourceToken={sourceToken}
        slippagePercentage={slippagePercentage}
      />
      <Button
        // TODO fix duplicate conditions
        disabled={
          isSwapping ||
          isApproving ||
          parseFloat(sourceAmount) === 0 ||
          parseFloat(destinationAmount) === 0 ||
          sourceToken === undefined ||
          destinationToken === undefined ||
          sourceTokenDisabled ||
          destinationTokenDisabled ||
          sourceToken.symbol === destinationToken.symbol ||
          (sourceTokenBalance &&
            sourceToken.isGasToken &&
            sourceAmount !== '' &&
            parseUnits(sourceAmount, sourceToken.decimals).gte(sourceTokenBalance)) ||
          (sourceTokenBalance &&
            sourceAmount !== '' &&
            parseUnits(sourceAmount, sourceToken.decimals).gt(sourceTokenBalance))
        }
        onClick={handleSwap}
        className={'w-full mt-2 flex-row-center justify-center'}
        variant={ButtonVariant.PRIMARY}
        size={ButtonSize.LARGE}
      >
        {isSwapping ? 'Swapping...' : ''}
        {isApproving ? 'Approving...' : ''}
        {!isSwapping && !isApproving
          ? sourceTokenBalance &&
            sourceToken &&
            sourceAmount !== '' &&
            sourceToken.isGasToken &&
            parseUnits(sourceAmount, sourceToken.decimals).gte(sourceTokenBalance)
            ? 'You cannot Swap all of your gas token'
            : sourceToken &&
              sourceTokenBalance &&
              sourceAmount !== '' &&
              parseUnits(sourceAmount, sourceToken.decimals).gt(sourceTokenBalance)
            ? 'Insufficient funds'
            : 'Swap'
          : ''}
      </Button>
      <div className={'text-body px-2 my-2'}>
        {(isSwapping || swapConfirmed) && (
          <div>
            <TransactionStep
              show={true}
              transactionError={transactionError}
              stepComplete={tokenIsApproved}
            >
              {tokenIsApproved ? 'Token approved' : 'Approving token'}
              <BlockExplorerLink transactionHash={approvalTransactionHash} />
            </TransactionStep>
            <TransactionStep
              show={swapSubmitted}
              transactionError={transactionError}
              stepComplete={swapConfirmed}
              showTransition={false}
            >
              {swapConfirmed ? 'Swap confirmed' : 'Swap confirming'}
              <BlockExplorerLink transactionHash={swapTransactionHash} />
            </TransactionStep>
            <TransactionError onClickClear={resetState} transactionError={transactionError} />
          </div>
        )}
      </div>
    </div>
  );
}
