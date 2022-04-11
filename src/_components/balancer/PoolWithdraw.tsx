import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { OnchainPoolData, Pool, PoolToken, TokenInfoMap } from '_interfaces/balancer';
import useUserBalancerPools from '_hooks/useUserBalancerPools';
import useMarketPrices from '_hooks/useMarketPrices';
import useCheckAndApproveTokenBalance from '_hooks/useCheckAndApproveTokenBalance';
import React, { useEffect, useState } from 'react';
import { EvmTokenDefinition } from '_enums/tokens';
import { amountIsValidNumberGtZero, getTokenByAddress } from '_utils/index';
import { absMaxBpt, calculatePoolInvestedAmounts, exactBPTInForTokenOut } from '_services/balancerCalculatorService';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { getPoolOnChainData, getVaultAddress } from '_services/balancerVaultService';
import { getErc20TokenInfo } from '_services/walletService';
import { getMarketDataForSymbol } from '_services/marketDataService';
import { MaxUint256 } from '_utils/maths';
import { getGasPrice } from '_services/gasService';
import { exitPoolForExactTokensOut } from '_services/balancerPoolService';
import { toggleBalancesAreStale } from '_redux/effects/walletEffects';
import { toggleUserPoolDataStale } from '_redux/effects/balancerEffects';
import { EthereumTransactionError } from '_interfaces/errors';
import { Switch } from '@headlessui/react';
import TokenSelectDropdown from '_components/TokenSelectDropdown';
import SingleCryptoAmountInput from '_components/core/SingleCryptoAmountInput';
import SingleCryptoAmountInputSkeleton from '_components/core/SingleCryptoAmountInputSkeleton';
import { HorizontalLineBreak } from '_components/core/HorizontalLineBreak';
import { Button } from '_components/core/Buttons';
import { TransactionStep } from '_components/transactions/TransactionStep';
import BlockExplorerLink from '_components/core/BlockExplorerLink';
import TransactionError from '_components/transactions/TransactionError';
import { BalancerFunction } from '_components/balancer/PoolFunctions';
import MaxAmountButton from '_components/core/MaxAmountButton';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { WithdrawMode } from '_enums/balancer';
import { BalancerActions, TransactionServices } from '_enums/db';
import { logTransaction } from '_services/dbService';

// TODO copy shared code between this and poolinvest
// TODO fix trace amoutns bug
export default function PoolWithdraw({ pool }: { pool: Pool }) {
  // const walletBalances = useWalletBalances();
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const { userPools } = useUserBalancerPools();
  const { provider, network, signer, tokenSet } = useSelector((state: AppState) => state.web3);

  const dispatch = useDispatch();
  const marketPrices = useMarketPrices();
  const checkAndApproveAllowance = useCheckAndApproveTokenBalance();
  const [approvalHash, setApprovalHash] = useState<string>();
  const [totalPoolBAlance, setTotalPoolBalance] = useState<string | null>(null);
  const [withdrawMode, setWithdrawMode] = useState<WithdrawMode>(WithdrawMode.OneToken);
  const [singleExitToken, setSingleExitToken] = useState<EvmTokenDefinition | undefined>(undefined);
  const [singleExitTokenIndex, setSingleExitTokenIndex] = useState<number | undefined>();
  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const [transactionComplete, setTransactionComplete] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [tokensApproved, setTokensApproved] = useState(false);
  const [transactionError, setTransactionError] = useState('');
  const [onChainData, setOnchain] = useState<OnchainPoolData | undefined>(undefined);
  const [sumOfAmountsInFiat, setSumOfAmountsInFiat] = useState<string | null>(null);
  const [amountsToWithdraw, setAmountsToWithdraw] = useState<string[]>([]);
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

  // const canInvestAmount = (): string => {
  //   const fiatValue = pool.tokens
  //     .map((t: PoolToken) => {
  //       const token = getTokenByAddress(tokenSet, t.address);
  //       // if (token.isGasToken) {
  //       //   const wrappedBalance = balanceFor(address);
  //       //   const nativeBalance = balanceFor(nativeAsset.address);
  //       //   tokenBalance = bnum(nativeBalance).gt(wrappedBalance)
  //       //     ? nativeBalance
  //       //     : wrappedBalance;
  //       // } else {
  //
  //       const tokenBalance = walletBalances[token.symbol]?.balance;
  //       // }
  //       const price = marketPrices.find(
  //         (m) => m.symbol.toLowerCase() === token.symbol.toLowerCase()
  //       )?.current_price;
  //       if (!price || !tokenBalance) {
  //         return '';
  //       }
  //       const f = getTokenValueInFiat(
  //         price,
  //         formatUnits(tokenBalance, token.decimals)
  //       );
  //       return f.toString();
  //     })
  //     .reduce((total, value) => new AdvancedBigNumber(total).plus(value).toString());
  //
  //   return fiatValue;
  // };
  useEffect(() => {
    if (provider && userPools) {
      const aaa = async () => {
        const onchain = await getPoolOnChainData(pool, provider);
        setOnchain(onchain);
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
          onchain,
          tokens,
          btpBalance?.toString() || '0',
          0,
          'send',
          'exit'
        );
        console.log(amounts);
        setAmountsInPool(amounts.receive);
        setTotalPoolBalance(btpBalance?.toString() || '0');
      };
      aaa();
    }
  }, [userPools]);
  // const walletBalanceGreaterThanZero = (token: PoolToken): boolean => {
  //   const bal = walletBalances[token.symbol as CryptoCurrencySymbol];
  //   return !bal || (bal && bal.balance.gt(0));
  // };

  // const getUserPoolBalance = (token: PoolToken): BigNumber | undefined => {
  //   if (!userPools) {
  //     return undefined;
  //   }
  //   const userPool = userPools.find((p) => p.poolId.id.toLowerCase() === pool.id.toLowerCase());
  //   if (!userPool) {
  //     return undefined;
  //   }
  //   const decimals = userPool.poolId.tokens.find(
  //     (t) => t.address.toLowerCase() === token.address.toLowerCase()
  //   )?.decimals;
  //   if (!decimals) {
  //     return undefined;
  //   }
  //   if (!userPool.balance) {
  //     return undefined;
  //   }
  //   if (userPool.balance && !decimalPlacesAreValid(userPool.balance, decimals)) {
  //     userPool.balance = fixDecimalPlaces(userPool.balance, decimals);
  //   }
  //   return parseUnits(userPool.balance, decimals);
  // };

  const handleTokenAmountChange = (tokenIndex: number, amount: string) => {
    const newTokenAmountMap = [...amountsToWithdraw];
    newTokenAmountMap[tokenIndex] = amount;
    setAmountsToWithdraw(newTokenAmountMap);
  };

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
      const data = getMarketDataForSymbol(marketPrices, pool.tokens[singleExitTokenIndex].symbol);
      if (data) {
        const price = data && data.current_price;
        total += price * parseFloat(amount);
      }
    } else {
      for (let i = 0; i < amountsToWithdraw.length; i++) {
        const amount = amountsToWithdraw[i];
        console.log(amount);
        if (!isNaN(parseFloat(amount))) {
          const token = pool.tokens[i];
          const tokenData = getTokenByAddress(tokenSet, token.address);
          const data = getMarketDataForSymbol(marketPrices, tokenData.symbol);
          if (data) {
            const price = data && data.current_price;
            total += price * parseFloat(amount);
          }
        }
      }
    }
    setSumOfAmountsInFiat(isNaN(total) ? null : total.toFixed(2));
  }, [amountsToWithdraw, withdrawMode, singleExitTokenIndex]);

  const exit = async () => {
    if (userAddress && signer && amountsToWithdraw && provider && network) {
      try {
        const addressesSorted = pool.tokens.map((t) => t.address).sort();
        const amountsOut: string[] = [];
        const vaultAddress = getVaultAddress(network.chainId);
        setTransactionInProgress(true);
        for (let i = 0; i < addressesSorted.length; i++) {
          const address = addressesSorted[i];
          const amount = parseUnits(amountsToWithdraw[i], pool.tokens[i].decimals);
          amountsOut.push(amount.toString());
          if (amount.gt(0)) {
            await checkAndApproveAllowance(
              address,
              userAddress,
              setApprovalHash,
              MaxUint256,
              TransactionServices.Balancer,
              vaultAddress,
            );
          }
        }
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
        logTransaction(tx.hash, network.chainId, TransactionServices.Balancer, BalancerActions.Withdraw);
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

  const stateIsValid = (): boolean => {
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
      <Switch.Group>
        <div className={'flex-row-center text-color-dark my-2 px-4 justify-end'}>
          <Switch.Label className="mr-4">Withdraw to single token</Switch.Label>
          <Switch
            checked={withdrawMode === WithdrawMode.OneToken}
            onChange={(checked) =>
              setWithdrawMode(checked ? WithdrawMode.OneToken : WithdrawMode.AllTokens)
            }
            className={`${
              withdrawMode === WithdrawMode.OneToken ? 'bg-gray-700' : 'bg-gray-200'
            } relative inline-flex transition items-center h-6 rounded-full w-11`}
          >
            <span className="sr-only">Enable notifications</span>
            <span
              className={`${
                withdrawMode === WithdrawMode.OneToken ? 'translate-x-6' : 'translate-x-1'
              } inline-block w-4 h-4 transform bg-white rounded-full`}
            />
          </Switch>
        </div>
      </Switch.Group>

      {onChainData && withdrawMode === WithdrawMode.OneToken && (
        <div className={'px-2'}>
          <TokenSelectDropdown
            tokenFilter={(t) =>
              Object.keys(onChainData.tokens)
                .map((address: string) => address.toLowerCase())
                .includes(t.address.toLowerCase())
            }
            selectedToken={singleExitToken}
            onSelectToken={(token: EvmTokenDefinition) => {
              setSingleExitToken(token);
            }}
            disabled={false}
          />
          <div>
            {amountsToWithdraw &&
            amountsToWithdraw.length > 0 &&
            tokenSet &&
            singleAssetMaxes &&
            singleAssetMaxes.length > 0 &&
            singleExitTokenIndex !== undefined &&
            amountsToWithdraw[singleExitTokenIndex] ? (
              <SingleCryptoAmountInput
                disabled={parseUnits(
                  singleAssetMaxes[singleExitTokenIndex] || '0',
                  pool.tokens[singleExitTokenIndex].decimals
                ).eq(0)}
                amount={amountsToWithdraw[singleExitTokenIndex]}
                balance={parseUnits(
                  singleAssetMaxes[singleExitTokenIndex] || '0',
                  pool.tokens[singleExitTokenIndex].decimals
                )}
                amountChanged={(amount: string) =>
                  handleTokenAmountChange(singleExitTokenIndex, amount)
                }
                maxAmount={parseUnits(
                  singleAssetMaxes[singleExitTokenIndex] || '0',
                  pool.tokens[singleExitTokenIndex].decimals
                )}
                token={getTokenByAddress(tokenSet, pool.tokens[singleExitTokenIndex].address)}
              />
            ) : (
              <SingleCryptoAmountInputSkeleton />
            )}
          </div>
        </div>
      )}
      {withdrawMode === WithdrawMode.AllTokens &&
        amountsToWithdraw &&
        amountsInPool &&
        pool.tokens.map((token: PoolToken, index: number) => (
          <div key={token.symbol} className={'px-2'}>
            <SingleCryptoAmountInput
              disabled={amountsInPool[index] === '0'}
              amount={amountsToWithdraw[index]}
              balance={parseUnits(amountsInPool[index], token.decimals)}
              maxAmount={parseUnits(amountsInPool[index], token.decimals)}
              amountChanged={(amount: string) => handleTokenAmountChange(index, amount)}
              token={getTokenByAddress(tokenSet, token.address)}
            />
          </div>
        ))}

      <div className={'px-4 mt-2'}>
        <HorizontalLineBreak />
        <div className={'flex-row-center mb-2 justify-between text-body'}>
          <div>Total:</div>
          <div className={'flex-row-center'}>
            <div className={'font-mono'}>{sumOfAmountsInFiat ? `$${sumOfAmountsInFiat}` : '-'}</div>
            <MaxAmountButton onClick={handleMaxAmountPressed} />
          </div>
        </div>
        <div>
          <Button
            disabled={transactionInProgress || !stateIsValid()}
            className={'w-full'}
            onClick={exit}
          >
            {BalancerFunction.Withdraw}
          </Button>
        </div>
      </div>

      <div className={'text-body px-2 my-2'}>
        {(transactionInProgress || transactionComplete) && (
          <div>
            <TransactionStep
              show={true}
              transactionError={transactionError}
              stepComplete={tokensApproved}
            >
              {tokensApproved ? 'Tokens approved' : 'Approving tokens'}
              <BlockExplorerLink transactionHash={approvalHash} />
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
