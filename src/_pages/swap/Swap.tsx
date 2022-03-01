import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import React, { useCallback, useState } from 'react';
import { TokenDefinition } from '_enums/tokens';
import { Button, ButtonSize, ButtonVariant } from '_components/core/Buttons';
import { OptimalRate, SwapSide } from 'paraswap-core';
import { Allowance } from 'paraswap/build/types';
import debounce from 'lodash/debounce';
import {
  approveToken,
  buildSwapTransaction,
  getAllowance,
  getExchangeRate,
  initialiseParaSwap
} from '_services/paraSwapService';
import { convertGweiToHumanAmount, convertHumanAmountToGwei } from '_services/priceService';
import { executeEthTransaction } from '_services/walletService';
import { TransactionStep } from '_components/transactions/TransactionStep';
import { SwitchVerticalIcon } from '@heroicons/react/outline';
import BlockExplorerLink from '_components/core/BlockExplorerLink';
import TransactionError from '_components/transactions/TransactionError';
import SwapAmountInput from '_pages/swap/SwapAmountInput';
import PoweredByLink from '_components/core/PoweredByLink';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { paraswapLogo } from '_assets/images';

export default function Swap() {
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const provider = useSelector((state: AppState) => state.web3.provider);
  const network = useSelector((state: AppState) => state.web3.network);
  const tokens = useSelector((state: AppState) => state.web3.tokenSet);
  const [fetchingPriceError, setFetchingPriceError] = useState('');
  const [sourceToken, setSourceToken] = useState<TokenDefinition>(Object.values(tokens)[0]);
  const [destinationToken, setDestinationToken] = useState<TokenDefinition>(
    Object.values(tokens)[1]
  );
  const [sourceTokenDisabled, setSourceTokenDisabled] = useState<boolean>(false);
  const [destinationTokenDisabled, setDestinationTokenDisabled] = useState<boolean>(false);
  const [sourceAmount, setSourceAmount] = useState<number>(0.0);
  const [sourceFiatAmount, setSourceFiatAmount] = useState<number>(0.0);
  const [destinationFiatAmount, setDestinationFiatAmount] = useState<number>(0.0);
  const [destinationAmount, setDestinationAmount] = useState<number>(0.0);
  const [fetchingPrices, setFetchingPrices] = useState<boolean>(false);
  const [approvalTransactionHash, setApprovalTransactionHAsh] = useState<string>('');
  const [swapTransactionHash, setSwapTransactionHash] = useState<string>('');
  const [transactionError, setTransactionError] = useState<string>('');
  const [priceRoute, setPriceRoute] = useState<OptimalRate>();
  const [isApproving, setIsApproving] = useState<boolean>(false);
  if (provider) {
    initialiseParaSwap(provider, network.chainId);
  }
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [tokenIsApproved, setTokenIsApproved] = useState<boolean>(false);
  const [swapSubmitted, setSwapSubmitted] = useState<boolean>(false);
  const [swapConfirmed, setSwapConfirmed] = useState<boolean>(false);

  const updateExchangeRate = async (
    amount: number,
    srcToken: TokenDefinition,
    destToken: TokenDefinition
  ) => {
    if (destToken && amount) {
      setFetchingPriceError('');
      try {
        setDestinationTokenDisabled(true);
        setSourceTokenDisabled(true);
        setFetchingPrices(true);
        const srcAmount = convertHumanAmountToGwei(amount, srcToken.decimals);
        const rate = await getExchangeRate(
          srcToken.address,
          destToken.address,
          srcAmount,
          srcToken.decimals,
          destToken.decimals
        );
        console.log('rate', rate);
        setPriceRoute(rate);
        setSourceFiatAmount(parseFloat(rate.srcUSD));
        setDestinationFiatAmount(parseFloat(rate.destUSD));
        setDestinationAmount(convertGweiToHumanAmount(rate.destAmount, destToken.decimals));
      } catch (e: any) {
        console.log(e);
        setFetchingPriceError(e.message);
      }
      setFetchingPrices(false);
      setDestinationTokenDisabled(false);
      setSourceTokenDisabled(false);
    }
  };

  const handleSwap = async () => {
    if (provider && destinationToken && priceRoute) {
      try {
        setIsSwapping(true);
        const allowance: Allowance = await getAllowance(userAddress, sourceToken.address);
        const sourceAmountInGwei = convertHumanAmountToGwei(sourceAmount, sourceToken.decimals);
        console.log(
          'SWAPPING',
          sourceAmountInGwei,
          'SOURCETOKEN',
          sourceToken.name,
          'DESTINATIONTOKEN',
          destinationToken.name
        );
        console.log('ALLOWANCE', allowance);
        console.log('SOURCE AMOUNT', sourceAmountInGwei);
        console.log(allowance.allowance < sourceAmountInGwei);
        // if (allowance.allowance > sourceAmountInGwei) {
        console.log('GETTING GAS');
        // console.log(await provider.getGasPrice());
        const hash = await approveToken(sourceAmountInGwei, userAddress, sourceToken.address);
        // const tx = ethers.utils.transa
        setApprovalTransactionHAsh(hash);
        console.log('APPROVE HASh', hash);
        const approvalTx: TransactionResponse = await provider.getTransaction(hash);
        await approvalTx.wait(1);
        // }
        setTokenIsApproved(true);
        const allowance2: Allowance = await getAllowance(userAddress, sourceToken.address);
        console.log('NEW ALLOWANCE', allowance2);
        console.log(
          'SWAPPING',
          sourceAmountInGwei,
          'SOURCETOKEN',
          sourceToken.name,
          'DESTINATIONTOKEN',
          destinationToken.name
        );
        const tx = await buildSwapTransaction(
          sourceToken,
          destinationToken,
          userAddress,
          priceRoute,
          10
        );
        const txHash = await executeEthTransaction(tx, provider, false);
        setSwapTransactionHash(txHash);
        const actionTx: TransactionResponse = await provider.getTransaction(hash);
        await actionTx.wait(1);
        setSwapConfirmed(true)
        setTransactionError('');
      } catch (e: any) {
        setTransactionError(e.data?.message || e.message);
        console.log(e);
      }
    }
  };

  const debouncedSave = useCallback(
    debounce(
      (nextValue, srcToken, destToken) => updateExchangeRate(nextValue, srcToken, destToken),
      750
    ),
    [] // will be created only once initially
  );

  const sourceAmountChanged = (amount: number) => {
    setSourceAmount(amount);
    debouncedSave(amount, sourceToken, destinationToken);
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
        <span className={'text-title'}>Swap</span>
        <PoweredByLink url={'https://paraswap.io'} logo={paraswapLogo} />
      </div>
      <SwapAmountInput
        amountInFiat={sourceFiatAmount}
        token={sourceToken}
        tokenChanged={setSourceToken}
        amount={sourceAmount}
        amountChanged={sourceAmountChanged}
        disabled={isSwapping || sourceTokenDisabled}
        source={SwapSide.SELL}
      />
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
            <SwitchVerticalIcon className={'h-4 w-4'} />
          </Button>
        </div>
      </div>
      <SwapAmountInput
        amountInFiat={destinationFiatAmount}
        token={destinationToken}
        tokenChanged={setDestinationToken}
        amount={destinationAmount}
        amountChanged={setDestinationAmount}
        disabled={isSwapping || destinationTokenDisabled}
        source={SwapSide.BUY}
      />
      <div
        className={
          'bg-gray-100 text-gray-500 rounded-2xl px-4 space-y-2 sm:space-y-0 sm:px-6 py-4 my-3 flex flex-col sm:flex-row items-start sm:items-center justify-between'
        }
      >
        {fetchingPrices ? (
          <span>Fetching prices...</span>
        ) : (
          <>
            <div>
              {destinationToken && (
                <>
                  💰
                  <span className={'ml-2'}>
                    1 {sourceToken.symbol} = {destinationAmount} {destinationToken?.symbol}
                  </span>
                </>
              )}
            </div>
            <div>
              {priceRoute && (
                <div>
                  ⛽
                  <span className={'ml-2'}>
                    Gas fees: ~${parseFloat(priceRoute.gasCostUSD).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <TransactionError transactionError={fetchingPriceError} />
      <Button
        disabled={
          isSwapping ||
          isApproving ||
          sourceAmount === 0 ||
          destinationAmount === 0 ||
          sourceToken === undefined ||
          destinationToken === undefined ||
          sourceTokenDisabled ||
          destinationTokenDisabled
        }
        onClick={handleSwap}
        className={'w-full mt-2 flex-row-center justify-center'}
        variant={ButtonVariant.PRIMARY}
        size={ButtonSize.LARGE}
      >
        {isSwapping ? 'Swapping...' : ''}
        {isApproving ? 'Approving...' : ''}
        {!isSwapping && !isApproving ? 'Swap' : ''}
      </Button>
      <div className={'text-title px-2 my-2'}>
        {isSwapping && (
          <div>
            <TransactionStep
              show={true}
              transactionError={transactionError}
              stepComplete={tokenIsApproved}
            >
              Token is approved
              <BlockExplorerLink transactionHash={approvalTransactionHash} />
            </TransactionStep>
            <TransactionStep
              show={true}
              transactionError={transactionError}
              stepComplete={swapSubmitted}
            >
              Transaction submitted to the blockchain
            </TransactionStep>
            <TransactionStep
              show={swapSubmitted}
              transactionError={transactionError}
              stepComplete={swapConfirmed}
              showTransition={false}
            >
              Swap confirmed
              <BlockExplorerLink transactionHash={swapTransactionHash} />
            </TransactionStep>
            <TransactionError transactionError={transactionError} />
          </div>
        )}
      </div>
    </div>
  );
}
