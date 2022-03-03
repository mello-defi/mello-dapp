import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import React, { useCallback, useState } from 'react';
import { TokenDefinition } from '_enums/tokens';
import { Button, ButtonSize, ButtonVariant } from '_components/core/Buttons';
import { OptimalRate } from 'paraswap-core';
import { Allowance } from 'paraswap/build/types';
import debounce from 'lodash/debounce';
import {
  approveToken,
  buildSwapTransaction,
  getAllowance,
  getExchangeRate,
  initialiseParaSwap
} from '_services/paraSwapService';
import { executeEthTransaction } from '_services/walletService';
import { TransactionStep } from '_components/transactions/TransactionStep';
import BlockExplorerLink from '_components/core/BlockExplorerLink';
import TransactionError from '_components/transactions/TransactionError';
import CryptoAmountInput from '_components/CryptoAmountInput';
import PoweredByLink from '_components/core/PoweredByLink';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { paraswapLogo } from '_assets/images';
import { BigNumber, ethers } from 'ethers';
import { getGasPrice } from '_services/gasService';
import SwapPriceInformation from '_pages/swap/SwapPriceInformation';
import useWalletBalance from '_hooks/useWalletBalance';
import SlippageControl from '_pages/swap/SlippageControl';
import { SwapVert } from '@mui/icons-material';

export default function Swap() {
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const provider = useSelector((state: AppState) => state.web3.provider);
  const network = useSelector((state: AppState) => state.web3.network);
  const tokens = useSelector((state: AppState) => state.web3.tokenSet);
  const [fetchingPriceError, setFetchingPriceError] = useState('');
  const [sourceToken, setSourceToken] = useState<TokenDefinition>(Object.values(tokens)[0]);
  const sourceTokenBalance = useWalletBalance(sourceToken);
  const [destinationToken, setDestinationToken] = useState<TokenDefinition>(
    Object.values(tokens)[1]
  );
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
  if (provider) {
    initialiseParaSwap(provider, network.chainId);
  }
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [tokenIsApproved, setTokenIsApproved] = useState<boolean>(false);
  const [swapSubmitted, setSwapSubmitted] = useState<boolean>(false);
  const [swapConfirmed, setSwapConfirmed] = useState<boolean>(false);

  const updateExchangeRate = async (
    amount: string,
    srcToken: TokenDefinition,
    destToken: TokenDefinition
  ) => {
    if (destToken && amount && parseFloat(amount) > 0 && srcToken.symbol !== destToken.symbol) {
      setFetchingPriceError('');
      try {
        setDestinationTokenDisabled(true);
        setSourceTokenDisabled(true);
        setFetchingPrices(true);
        const srcAmount: BigNumber = ethers.utils.parseUnits(amount, srcToken.decimals);
        const rate = await getExchangeRate(srcToken, destToken, srcAmount.toString());
        console.log('rate', rate);
        setPriceRoute(rate);
        setSourceFiatAmount(parseFloat(rate.srcUSD));
        setDestinationFiatAmount(parseFloat(rate.destUSD));
        setDestinationAmount(ethers.utils.formatUnits(rate.destAmount, destToken.decimals));
        setSwapConfirmed(false);
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
    if (provider && destinationToken && priceRoute && userAddress) {
      try {
        setIsSwapping(true);
        if (!sourceToken.isGasToken) {
          const allowance: Allowance = await getAllowance(userAddress, sourceToken.address);
          const amount: BigNumber = ethers.utils.parseUnits(
            sourceAmount.toString(),
            sourceToken.decimals
          );
          if (amount.gt(allowance.allowance)) {
            const gasPriceResult = await getGasPrice(network.gasStationUrl);
            let gasPrice: BigNumber | undefined;
            if (gasPriceResult) {
              gasPrice = ethers.utils.parseUnits(gasPriceResult?.fastest.toString(), 'gwei');
            }
            const approvalTxHash = await approveToken(
              amount,
              userAddress,
              sourceToken.address,
              gasPrice
            );
            setApprovalTransactionHAsh(approvalTxHash);
            const approvalTx: TransactionResponse = await provider.getTransaction(approvalTxHash);
            await approvalTx.wait(1);
          }
        }
        setTokenIsApproved(true);
        const tx = await buildSwapTransaction(
          sourceToken,
          destinationToken,
          userAddress,
          priceRoute,
          10
        );
        const swapTxHash = await executeEthTransaction(tx, provider, false);
        setSwapTransactionHash(swapTxHash);
        setSwapSubmitted(true);
        const actionTx: TransactionResponse = await provider.getTransaction(swapTxHash);
        await actionTx.wait(1);
        setSwapConfirmed(true);
        setSourceAmount('0.0');
        setDestinationAmount('0.0');
        setTransactionError('');
        setIsSwapping(false);
        setIsApproving(false);
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

  const sourceAmountChanged = (amount: string) => {
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

  console.log('priceRoute', priceRoute);
  return (
    <div>
      <div className={'px-2 flex-row-center justify-between'}>
        <span className={'text-header'}>Swap</span>
        <PoweredByLink url={'https://paraswap.io'} logo={paraswapLogo} />
      </div>
      <CryptoAmountInput
        amountInFiat={sourceFiatAmount}
        token={sourceToken}
        tokenChanged={setSourceToken}
        amount={sourceAmount}
        amountChanged={sourceAmountChanged}
        disabled={isSwapping || sourceTokenDisabled}
        // source={SwapSide.SELL}
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
            <SwapVert className={'h-4 w-4'} />
          </Button>
        </div>
      </div>
      <CryptoAmountInput
        amountInFiat={destinationFiatAmount}
        token={destinationToken}
        tokenChanged={setDestinationToken}
        amount={destinationAmount}
        amountChanged={setDestinationAmount}
        disabled={isSwapping || destinationTokenDisabled}
        // source={SwapSide.BUY}
      />
      <TransactionError transactionError={fetchingPriceError} />
      {/*<SlippageControl slippage={slippage}/>*/}
      <SwapPriceInformation
        fetchingPrices={fetchingPrices}
        destinationToken={destinationToken}
        priceRoute={priceRoute}
        sourceToken={sourceToken}
        slippagePercentage={slippagePercentage}
      />
      <Button
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
          sourceTokenBalance && sourceToken.isGasToken && ethers.utils.parseUnits(sourceAmount, sourceToken.decimals).gte(sourceTokenBalance)
        }
        onClick={handleSwap}
        className={'w-full mt-2 flex-row-center justify-center'}
        variant={ButtonVariant.PRIMARY}
        size={ButtonSize.LARGE}
      >
        {isSwapping ? 'Swapping...' : ''}
        {isApproving ? 'Approving...' : ''}
        {!isSwapping && !isApproving ? sourceTokenBalance && sourceToken && sourceToken.isGasToken && ethers.utils.parseUnits(sourceAmount, sourceToken.decimals).gte(sourceTokenBalance) ? 'You cannot swap all of your gas token' : 'Swap' : ''}
      </Button>
      <div className={'text-body px-2 my-2'}>
        {(isSwapping || swapConfirmed) && (
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
