import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { OnchainPoolData, Pool, TokenInfoMap } from '_interfaces/balancer';
import useUserBalancerPools from '_hooks/useUserBalancerPools';
import useMarketPrices from '_hooks/useMarketPrices';
import React, { useEffect, useState } from 'react';
import { EvmTokenDefinition } from '_enums/tokens';
import { amountIsValidNumberGtZero, getTokenByAddress } from '_utils/index';
import {
  absMaxBpt,
  calculatePoolInvestedAmounts,
  exactBPTInForTokenOut
} from '_services/balancerCalculatorService';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { getGasPrice } from '_services/gasService';
import { exitPoolForExactTokensOut } from '_services/balancerPoolService';
import { toggleBalancesAreStale } from '_redux/effects/walletEffects';
import { toggleUserPoolDataStale } from '_redux/effects/balancerEffects';
import { EthereumTransactionError } from '_interfaces/errors';
import { TransactionStep } from '_components/transactions/TransactionStep';
import BlockExplorerLink from '_components/core/BlockExplorerLink';
import TransactionError from '_components/transactions/TransactionError';
import { BalancerFunction } from '_components/balancer/PoolFunctions';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { WithdrawMode } from '_enums/balancer';
import useBalancerFunctions from '_hooks/useBalancerFunctions';
import { BalancerActions, TransactionServices } from '_enums/db';
import { logTransaction } from '_services/dbService';
import { getPoolOnChainData } from '_services/balancerVaultService';
import { getErc20TokenInfo } from '_services/walletService';
import WithdrawModeToggle from '_components/balancer/WithdrawModeToggle';
import WithdrawSingleTokenForm from '_components/balancer/WithdrawSingleTokenForm';
import WithdrawAllTokensForm from '_components/balancer/WithdrawAllTokensForm';
import BalancerPoolFunctionSummary from '_components/balancer/BalancerPoolFunctionSummary';

// TODO fix trace amoutns bug
export default function PoolWithdraw({ pool }: { pool: Pool }) {
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const { userPools } = useUserBalancerPools();
  const { provider, network, signer, tokenSet } = useSelector((state: AppState) => state.web3);
  const {
    sumAmounts,
    amounts: amountsToWithdraw,
    setAmounts: setAmountsToWithdraw,
    handleTokenAmountChange,
    checkApprovalsAndGetAmounts,
    transactionInProgress,
    setTransactionInProgress,
    transactionComplete,
    setTransactionComplete,
    transactionHash,
    setTransactionHash,
    transactionError,
    setTransactionError,
    setTokensApproved,
    tokensApproved,
    tokenApprovalHash,
    setSumOfAmountsInFiat,
    sumOfAmountsInFiat
  } = useBalancerFunctions();
  const dispatch = useDispatch();
  const marketPrices = useMarketPrices();
  const [withdrawMode, setWithdrawMode] = useState<WithdrawMode>(WithdrawMode.OneToken);
  const [singleExitToken, setSingleExitToken] = useState<EvmTokenDefinition | undefined>(undefined);
  const [singleExitTokenIndex, setSingleExitTokenIndex] = useState<number | undefined>();
  const [onChainData, setOnchain] = useState<OnchainPoolData | undefined>(undefined);
  const [amountsInPool, setAmountsInPool] = useState<string[]>([]);
  const [singleAssetMaxes, setSingleAssetMaxes] = useState<string[]>([]);

  useEffect(() => {
    if (!singleExitToken) {
      setSingleExitToken(getTokenByAddress(tokenSet, pool.tokens[0].address));
    }
    if (singleExitToken) {
      setSingleExitTokenIndex(
        pool.tokens.findIndex(
          (token) => token.address.toLowerCase() === singleExitToken.address.toLowerCase()
        )
      );
    }
  }, [singleExitToken]);

  const initTokenAmounts = () => {
    setAmountsToWithdraw(Array(pool.tokens.length).fill('0.0'));
  };
  useEffect(() => {
    if (!amountsToWithdraw.length) {
      initTokenAmounts();
    }
  }, [pool, amountsToWithdraw]);

  useEffect(() => {
    if (
      withdrawMode === WithdrawMode.OneToken &&
      singleAssetMaxes &&
      singleExitTokenIndex !== undefined
    ) {
      setAmountsToWithdraw([
        ...amountsToWithdraw.map((amount, index) =>
          index === singleExitTokenIndex ? singleAssetMaxes[singleExitTokenIndex] : '0'
        )
      ]);
    } else if (amountsInPool) {
      setAmountsToWithdraw(amountsInPool);
    }
  }, [withdrawMode, singleAssetMaxes, amountsInPool, singleExitTokenIndex]);
  useEffect(() => {
    if (
      !singleAssetMaxes ||
      (singleAssetMaxes.length === 0 && amountsToWithdraw && onChainData && provider && userAddress)
    ) {
      const doStuff = async () => {
        const maxes = await getSingleAssetMaxes();
        console.log('maxes', maxes);
        setSingleAssetMaxes(maxes);
      };
      doStuff();
    }
  }, [onChainData, amountsToWithdraw, userAddress, provider]);
  const getSingleAssetMaxes = async (): Promise<string[]> => {
    const btpBalance = userPools?.find(
      (userPool) => userPool.poolId.address.toLowerCase() === pool.address.toLowerCase()
    )?.balance;
    if (amountsToWithdraw && onChainData && btpBalance && provider && userAddress) {
      try {
        const amounts = [];
        for (let i = 0; i < pool.tokens.length; i++) {
          const token = pool.tokens[i];
          const amount = await exactBPTInForTokenOut(
            parseUnits(btpBalance, onChainData.decimals).toString(),
            i,
            pool.poolType,
            pool.tokens,
            provider,
            pool.id,
            userAddress
          );
          amounts.push(formatUnits(amount.toString(), token.decimals));
        }
        return amounts;
      } catch (error) {
        console.error(error);
        if ((error as Error).message.includes('MIN_BPT_IN_FOR_TOKEN_OUT')) {
          const amounts = [];
          // setError(WithdrawalError.SINGLE_ASSET_WITHDRAWAL_MIN_BPT_LIMIT);
          for (let i = 0; i < pool.tokens.length; i++) {
            const token = pool.tokens[i];
            // console.log(exactBPTInForTokenOut);
            const amount = await exactBPTInForTokenOut(
              parseUnits(absMaxBpt(pool, onChainData, btpBalance), onChainData.decimals).toString(),
              i,
              pool.poolType,
              pool.tokens,
              provider,
              pool.id,
              userAddress
            );
            amounts.push(formatUnits(amount.toString(), token.decimals));
          }
          return amounts;
        }
      }
    }
    return Array.from({ length: pool.tokens.length }, () => '0');
  };

  useEffect(() => {
    if (provider && userPools) {
      // move get onchain data to separate hook
      // move all of this osther stuff to poolservice
      const getUserPoolAmounts = async () => {
        const onChainData = await getPoolOnChainData(pool, provider);
        setOnchain(onChainData);
        const tokens: TokenInfoMap = {};
        for (const token of pool.tokens) {
          tokens[token.address.toLowerCase()] = {
            ...token,
            symbol: token.symbol.toLowerCase(),
            chainId: network.chainId
          };
        }
        const poolTokenInfo = await getErc20TokenInfo(provider, pool.address);
        tokens[pool.address] = {
          ...poolTokenInfo,
          chainId: network.chainId
        };
        const btpBalance = userPools?.find(
          (userPool) => userPool.poolId.address.toLowerCase() === pool.address.toLowerCase()
        )?.balance;
        const amounts = calculatePoolInvestedAmounts(
          pool.address,
          onChainData,
          tokens,
          btpBalance?.toString() || '0',
          0,
          'send',
          'exit'
        );
        console.log(amounts);
        setAmountsInPool(amounts.receive);
      };
      getUserPoolAmounts();
    }
  }, [userPools]);

  useEffect(() => {
    if (!amountsToWithdraw.length) {
      setSumOfAmountsInFiat('0.0');
    }
    let total = 0;
    if (withdrawMode === WithdrawMode.OneToken && singleExitTokenIndex) {
      const withdrawTokenIndex = pool.tokens.findIndex(
        (t) => t.address.toLowerCase() === pool.tokens[singleExitTokenIndex].address.toLowerCase()
      );
      const amount = amountsToWithdraw[withdrawTokenIndex];
      const price = marketPrices[pool.tokens[singleExitTokenIndex].address.toLowerCase()];
      if (price) {
        total += price * parseFloat(amount);
      }
    } else {
      total = sumAmounts(pool.tokens);
    }
    setSumOfAmountsInFiat(isNaN(total) ? null : total.toFixed(2));
  }, [amountsToWithdraw, withdrawMode]);

  const exit = async () => {
    if (userAddress && signer && amountsToWithdraw && provider && network) {
      try {
        setTransactionInProgress(true);
        const amountsOut = await checkApprovalsAndGetAmounts(pool.tokens);
        // await checkAndApproveAllowance(
        //   pool.address,
        //   userAddress,
        //   setApprovalHash,
        //   MaxUint256,
        //   vaultAddress
        // );
        setTokensApproved(true);
        const gasResult = await getGasPrice(network.gasStationUrl);
        let tx: TransactionResponse;
        if (withdrawMode === WithdrawMode.OneToken) {
          if (singleExitTokenIndex === undefined) {
            throw new Error('No token selected');
          }
          // const poolBalance = userPools?.find(
          //   (userPool) => userPool.poolId.address.toLowerCase() === pool.address.toLowerCase()
          // )?.balance;
          // if (!poolBalance) {
          //   throw new Error('Could not get balance');
          // }
          // console.log('amountsOut[singleExitTokenIndex]', parseUnits(amountsOut[singleExitTokenIndex], 18).toString());
          // console.log('poolBalance', poolBalance);
          // TODO move to exitPoolForOneTokenOut
          tx = await exitPoolForExactTokensOut(
            pool,
            userAddress,
            signer,
            amountsOut,
            gasResult?.fastest
            // parseUnits(poolBalance, 18).toString(),
            // singleExitTokenIndex,
            // gasResult?.fastest
          );
        } else {
          tx = await exitPoolForExactTokensOut(
            pool,
            userAddress,
            signer,
            amountsOut,
            gasResult?.fastest
          );
        }
        logTransaction(
          tx.hash,
          network.chainId,
          TransactionServices.Balancer,
          BalancerActions.Withdraw
        );
        setTransactionHash(tx.hash);
        await tx.wait(3);
        setTransactionComplete(true);
        dispatch(toggleUserPoolDataStale(true));
        dispatch(toggleBalancesAreStale(true));
        initTokenAmounts();
      } catch (e: any) {
        console.error(e);
        // TODO move to hook
        const errorParsed = typeof e === 'string' ? (JSON.parse(e) as EthereumTransactionError) : e;
        setTransactionError(
          `${errorParsed.message}${errorParsed.data ? ' - ' + errorParsed.data.message : ''}`
        );
      }
    }
  };

  const stateValuesAreValid = (): boolean => {
    if (!amountsToWithdraw.length) {
      return false;
    }
    let nonZeroAmounts = 0;
    if (withdrawMode === WithdrawMode.AllTokens) {
      for (let i = 0; i < amountsToWithdraw.length; i++) {
        const amount = amountsToWithdraw[i];
        if (amountIsValidNumberGtZero(amount)) {
          nonZeroAmounts++;
          const amountBn = parseUnits(amount, pool.tokens[i].decimals);
          const balanceBn = parseUnits(amountsInPool[i], pool.tokens[i].decimals);
          if (amountBn.gt(balanceBn)) {
            return false;
          }
        }
      }
    } else if (
      withdrawMode === WithdrawMode.OneToken &&
      singleExitTokenIndex !== undefined &&
      singleExitTokenIndex >= 0 &&
      singleAssetMaxes &&
      singleAssetMaxes.length > 0
    ) {
      const amount = amountsToWithdraw[singleExitTokenIndex];
      if (amountIsValidNumberGtZero(amount)) {
        nonZeroAmounts++;
        const maxAmountBn = parseUnits(
          singleAssetMaxes[singleExitTokenIndex],
          pool.tokens[singleExitTokenIndex].decimals
        );
        const currentAmountBn = parseUnits(amount, pool.tokens[singleExitTokenIndex].decimals);
        if (currentAmountBn.gt(maxAmountBn)) {
          return false;
        }
      }
    }

    if (nonZeroAmounts === 0) {
      return false;
    }
    if (sumOfAmountsInFiat === null && sumOfAmountsInFiat === 0) {
      return false;
    }
    return true;
  };

  const resetState = () => {
    initTokenAmounts();
    setTransactionHash('');
    setTransactionInProgress(false);
    setTransactionComplete(false);
    setTransactionError('');
    setTokensApproved(false);
  };

  const handleMaxAmountPressed = () => {
    if (withdrawMode === WithdrawMode.AllTokens) {
      const newTokenAmounts = [...amountsToWithdraw];
      for (let i = 0; i < newTokenAmounts.length; i++) {
        const balance = amountsInPool[i];
        if (amountIsValidNumberGtZero(balance)) {
          newTokenAmounts[i] = balance;
        } else {
          newTokenAmounts[i] = '0';
        }
      }
      setAmountsToWithdraw(newTokenAmounts);
    } else if (withdrawMode === WithdrawMode.OneToken && singleExitTokenIndex !== undefined) {
      setAmountsToWithdraw([
        ...amountsToWithdraw.map((amount, index) =>
          index === singleExitTokenIndex ? singleAssetMaxes[singleExitTokenIndex] : '0'
        )
      ]);
    }
  };

  return (
    <div className={'flex flex-col'}>
      <WithdrawModeToggle withdrawMode={withdrawMode} setWithdrawMode={setWithdrawMode} />
      {withdrawMode === WithdrawMode.OneToken && (
        <WithdrawSingleTokenForm
          poolTokens={pool.tokens}
          amountsToWithdraw={amountsToWithdraw}
          singleExitTokenIndex={singleExitTokenIndex}
          singleAssetMaxes={singleAssetMaxes}
          singleExitToken={singleExitToken}
          setSingleExitToken={setSingleExitToken}
          handleTokenAmountChange={handleTokenAmountChange}
        />
      )}
      {withdrawMode === WithdrawMode.AllTokens && (
        <WithdrawAllTokensForm
          poolTokens={pool.tokens}
          amountsToWithdraw={amountsToWithdraw}
          amountsInPool={amountsInPool}
          handleTokenAmountChange={handleTokenAmountChange}
        />
      )}
      <BalancerPoolFunctionSummary
        sumOfAmountsInFiat={sumOfAmountsInFiat}
        handleMaxAmountPressed={handleMaxAmountPressed}
        functionName={BalancerFunction.Withdraw}
        buttonDisabled={transactionInProgress || !stateValuesAreValid()}
        onClick={exit}
      />

      <div className={'text-body px-2 my-2'}>
        {(transactionInProgress || transactionComplete) && (
          <div>
            <TransactionStep
              show={true}
              transactionError={transactionError}
              stepComplete={tokensApproved}
            >
              {tokensApproved ? 'Tokens approved' : 'Approving tokens'}
              <BlockExplorerLink transactionHash={tokenApprovalHash} />
            </TransactionStep>
            <TransactionStep
              show={tokensApproved}
              transactionError={transactionError}
              stepComplete={transactionComplete}
              showTransition={false}
            >
              {transactionComplete ? 'Withdraw confirmed' : 'Withdraw confirming'}
              <BlockExplorerLink transactionHash={transactionHash} />
            </TransactionStep>
            <TransactionError onClickClear={resetState} transactionError={transactionError} />
          </div>
        )}
      </div>
    </div>
  );
}
