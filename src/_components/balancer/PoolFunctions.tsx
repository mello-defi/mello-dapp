import {
  Amounts,
  OnchainPoolData,
  Pool,
  PoolToken,
  TokenInfoMap,
  UserPool
} from '_interfaces/balancer';
import { BigNumber, ethers } from 'ethers';
import { BigNumber as AdvancedBigNumber } from '@aave/protocol-js';

import { getErc20TokenInfo } from '_services/walletService';
import { getGasPrice } from '_services/gasService';
import { MaxUint256 } from '_utils/maths';
import {
  absMaxBpt,
  exactBPTInForTokenOut,
  calculatePoolInvestedAmounts
} from '_services/balancerCalculatorService';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import React, { useEffect, useState } from 'react';
import useWalletBalances from '_hooks/useWalletBalances';
import { CryptoCurrencySymbol } from '_enums/currency';
import SingleCryptoAmountInput from '_components/core/SingleCryptoAmountInput';
import useMarketPrices from '_hooks/useMarketPrices';
import { EvmTokenDefinition } from '_enums/tokens';
import {
  amountIsValidNumberGtZero,
  decimalPlacesAreValid,
  fixDecimalPlaces,
  getTokenByAddress
} from '_utils/index';
import { getMarketDataForSymbol } from '_services/marketDataService';
import { HorizontalLineBreak } from '_components/core/HorizontalLineBreak';
import { Button } from '_components/core/Buttons';
import useCheckAndApproveTokenBalance from '_hooks/useCheckAndApproveTokenBalance';
import { formatTokenValueInFiat, getTokenValueInFiat } from '_services/priceService';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { DefaultTransition } from '_components/core/Transition';
import { TransactionStep } from '_components/transactions/TransactionStep';
import BlockExplorerLink from '_components/core/BlockExplorerLink';
import TransactionError from '_components/transactions/TransactionError';
import { toggleBalancesAreStale } from '_redux/effects/walletEffects';
import { EthereumTransactionError } from '_interfaces/errors';
import { toggleUserPoolDataStale } from '_redux/effects/balancerEffects';
import MaxAmountButton from '_components/core/MaxAmountButton';
import { TabHeader, TabHeaderContainer } from '_components/core/Tabs';
import TokenSelectDropdown from '_components/TokenSelectDropdown';
import { getUserPools } from '_services/balancerSubgraphClient';
import { getPoolOnChainData, getVaultAddress } from '_services/balancerVaultService';
import { exitPool, joinPool } from '_services/balancerPoolService';
import CryptoAmountWithTooltip from '_components/core/CryptoAmountTooltip';
import { Switch } from '@headlessui/react';

export enum BalancerFunction {
  Invest = 'Invest',
  Withdraw = 'Withdraw'
}

interface TokenAmountMap {
  [address: string]: string;
}

export enum WithdrawMode {
  AllTokens = 'All Tokens',
  SingleToken = 'Single Token'
}
function PoolWithdraw({ pool }: { pool: Pool }) {
  const walletBalances = useWalletBalances();
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const signer = useSelector((state: AppState) => state.web3.signer);
  const provider = useSelector((state: AppState) => state.web3.provider);
  const marketPrices = useMarketPrices();
  const tokenSet = useSelector((state: AppState) => state.web3.tokenSet);
  const network = useSelector((state: AppState) => state.web3.network);
  const checkAndApproveAllowance = useCheckAndApproveTokenBalance();
  const [approvalHash, setApprovalHash] = useState<string | null>(null);
  const [totalPoolBAlance, setTotalPoolBalance] = useState<string | null>(null);
  const [withdrawMode, setWithdrawMode] = useState<WithdrawMode>(WithdrawMode.SingleToken);
  const [singleExitToken, setSingleExitToken] = useState<EvmTokenDefinition | undefined>(undefined);
  const [onChainData, setOnchain] = useState<OnchainPoolData | undefined>(undefined);
  const [sumOfAmountsInFiat, setSumOfAmountsInFiat] = useState<string | null>(null);
  const [userPools, setUserPools] = useState<UserPool[] | undefined>(undefined);
  const [tokenAmounts, setTokenAmounts] = useState<string[]>([]);
  const [poolAmounts, setPoolAmounts] = useState<string[]>([]);
  const [singleAssetMaxes, setSingleAssetMaxes] = useState<string[]>([]);

  useEffect(() => {
    if (!singleExitToken) {
      setSingleExitToken(getTokenByAddress(tokenSet, pool.tokens[0].address));
    }
  }, [singleExitToken])

  const initTokenAmounts = () => {
    setTokenAmounts(Array(pool.tokens.length).fill('0.0'));
  };
  useEffect(() => {
    if (!tokenAmounts.length) {
      initTokenAmounts();
    }
  }, [pool, tokenAmounts]);

  useEffect(() => {
    if (withdrawMode === WithdrawMode.SingleToken && singleExitToken && singleAssetMaxes) {
      const tokenIndex = pool.tokens.findIndex(token => token.address.toLowerCase() === singleExitToken.address.toLowerCase());
      setTokenAmounts([...tokenAmounts.map((amount, index) => index === tokenIndex ? singleAssetMaxes[tokenIndex] : amount)]);
    } else if (poolAmounts) {
      setTokenAmounts(poolAmounts);
    }
  }, [withdrawMode, singleExitToken, singleAssetMaxes, poolAmounts])
  useEffect(() => {
    if (!singleAssetMaxes || singleAssetMaxes.length === 0 && tokenAmounts && onChainData && provider && userAddress) {
      const doStuff = async () => {
        const maxes = await getSingleAssetMaxes();
        setSingleAssetMaxes(maxes);
      };
      doStuff();
    }
  }, [userPools, onChainData, tokenAmounts, userAddress, provider]);
  const getSingleAssetMaxes = async (): Promise<string[]> => {
    const btpBalance = userPools?.find(
      (userPool) => userPool.poolId.address.toLowerCase() === pool.address.toLowerCase()
    )?.balance;
    if (tokenAmounts && onChainData && btpBalance && provider && userAddress) {
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
    if (userAddress && !userPools && provider) {
      const initUserPools = async () => {
        const results = await getUserPools(userAddress);
        setUserPools(results);
      };
      initUserPools();
    }
  }, [pool, userAddress]);

  const canInvestAmount = (): string => {
    const fiatValue = pool.tokens
      .map((t: PoolToken) => {
        const token = getTokenByAddress(tokenSet, t.address);
        // if (token.isGasToken) {
        //   const wrappedBalance = balanceFor(address);
        //   const nativeBalance = balanceFor(nativeAsset.address);
        //   tokenBalance = bnum(nativeBalance).gt(wrappedBalance)
        //     ? nativeBalance
        //     : wrappedBalance;
        // } else {

        const tokenBalance = walletBalances[token.symbol]?.balance;
        // }
        const price = marketPrices.find(
          (m) => m.symbol.toLowerCase() === token.symbol.toLowerCase()
        )?.current_price;
        if (!price || !tokenBalance) {
          return '';
        }
        const f = getTokenValueInFiat(
          price,
          ethers.utils.formatUnits(tokenBalance, token.decimals)
        );
        return f.toString();
      })
      .reduce((total, value) => new AdvancedBigNumber(total).plus(value).toString());

    return fiatValue;
  };
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
        setPoolAmounts(amounts.receive);
        setTotalPoolBalance(btpBalance?.toString() || '0');
      };
      aaa();
    }
  }, [userPools]);
  const walletBalanceGreaterThanZero = (token: PoolToken): boolean => {
    const bal = walletBalances[token.symbol as CryptoCurrencySymbol];
    return !bal || (bal && bal.balance.gt(0));
  };
  const getMarketPricesForPoolToken = (token: PoolToken): number => {
    const price = marketPrices.find((p) => p.symbol.toLowerCase() === token.symbol?.toLowerCase());
    if (price) {
      return price.current_price;
    }
    return 0;
  };

  const getUserPoolBalance = (token: PoolToken): BigNumber | undefined => {
    if (!userPools) {
      return undefined;
    }
    const userPool = userPools.find((p) => p.poolId.id.toLowerCase() === pool.id.toLowerCase());
    if (!userPool) {
      return undefined;
    }
    const decimals = userPool.poolId.tokens.find(
      (t) => t.address.toLowerCase() === token.address.toLowerCase()
    )?.decimals;
    if (!decimals) {
      return undefined;
    }
    if (!userPool.balance) {
      return undefined;
    }
    if (userPool.balance && !decimalPlacesAreValid(userPool.balance, decimals)) {
      userPool.balance = fixDecimalPlaces(userPool.balance, decimals);
    }
    return ethers.utils.parseUnits(userPool.balance, decimals);
  };

  const handleTokenAmountChange = (tokenIndex: number, amount: string) => {
    const newTokenAmountMap = [...tokenAmounts];
    newTokenAmountMap[tokenIndex] = amount;
    setTokenAmounts(newTokenAmountMap);
  };

  useEffect(() => {
    if (!tokenAmounts.length) {
      setSumOfAmountsInFiat('0.0');
    }
    let total = 0;
    if (withdrawMode === WithdrawMode.SingleToken && singleExitToken) {
      const withdrawTokenIndex = pool.tokens.findIndex(
        (t) => t.address.toLowerCase() === singleExitToken?.address.toLowerCase()
      );
      const amount = tokenAmounts[withdrawTokenIndex]
      const data = getMarketDataForSymbol(marketPrices, singleExitToken?.symbol);
      if (data) {
        const price = data && data.current_price;
        total += price * parseFloat(amount);
      }
    } else {
      for (let i = 0; i < tokenAmounts.length; i++) {
        const amount = tokenAmounts[i];
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
  }, [tokenAmounts, withdrawMode, singleExitToken]);

  const exit = async () => {
    if (userAddress && signer && tokenAmounts && provider && network) {
      try {
        const addressesSorted = pool.tokens.map((t) => t.address).sort();
        const amountsIn: string[] = [];
        const vaultAddress = getVaultAddress(network.chainId);
        for (let i = 0; i < addressesSorted.length; i++) {
          const address = addressesSorted[i];
          const decimals = pool.tokens.find((t) => t.address === address)?.decimals;
          const amount = ethers.utils.parseUnits(tokenAmounts[i], decimals).toString();
          amountsIn.push(amount);
          if (amount !== '0') {
            if (tokenAmounts[i] && parseFloat(tokenAmounts[i]) > 0) {
              await checkAndApproveAllowance(
                address,
                userAddress,
                setApprovalHash,
                MaxUint256,
                vaultAddress
              );
            }
          }
        }
        const gasResult = await getGasPrice(network.gasStationUrl);
        await exitPool(pool, userAddress, signer, amountsIn, gasResult?.fastest);
      } catch (e: any) {
        console.error(e);
      }
    }
  };

  return (
    <div className={'flex flex-col'}>
      <Switch.Group>
        <div className={'flex-row-center text-color-dark my-2 px-4 justify-end'}>
          <Switch.Label className="mr-4">Withdraw to single token</Switch.Label>
          <Switch
            checked={withdrawMode === WithdrawMode.SingleToken}
            onChange={(checked) => setWithdrawMode(checked ? WithdrawMode.SingleToken : WithdrawMode.AllTokens)}
            className={`${
              withdrawMode === WithdrawMode.SingleToken ? 'bg-gray-700' : 'bg-gray-200'
            } relative inline-flex transition items-center h-6 rounded-full w-11`}
          >
            <span className="sr-only">Enable notifications</span>
            <span
              className={`${
                withdrawMode === WithdrawMode.SingleToken ? 'translate-x-6' : 'translate-x-1'
              } inline-block w-4 h-4 transform bg-white rounded-full`}
            />
          </Switch>
        </div>
      </Switch.Group>

      {onChainData && withdrawMode === WithdrawMode.SingleToken && (
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
        </div>
      )}
      {tokenAmounts &&
        singleAssetMaxes.length > 0 &&
        pool.tokens.map((token: PoolToken, index: number) => (
          <div key={token.symbol} className={'px-2'}>
            {withdrawMode === WithdrawMode.AllTokens ? (
              <SingleCryptoAmountInput
                disabled={true}
                tokenPrice={getMarketPricesForPoolToken(token)}
                amount={tokenAmounts[index]}
                amountChanged={(amount: string) => handleTokenAmountChange(index, amount)}
                token={getTokenByAddress(tokenSet, token.address)}
              />
            ) : (
              <div>
                {singleExitToken &&
                  singleExitToken.address.toLowerCase() === token.address.toLowerCase() && (
                    <SingleCryptoAmountInput
                      disabled={false}
                      tokenPrice={getMarketPricesForPoolToken(token)}
                      amount={tokenAmounts[index]}
                      balance={ethers.utils.parseUnits(singleAssetMaxes[index], token.decimals)}
                      amountChanged={(amount: string) => handleTokenAmountChange(index, amount)}
                      token={getTokenByAddress(tokenSet, token.address)}
                    />
                  )}
              </div>
            )}
          </div>
        ))}

      <div className={'px-4 mt-2'}>
        <HorizontalLineBreak />
        <div className={'flex-row-center justify-between text-body'}>
          <div>Total:</div>
          <div className={'font-mono'}>${sumOfAmountsInFiat}</div>
        </div>
        <div>
          <Button className={'w-full'} onClick={exit}>
            {BalancerFunction.Withdraw}
          </Button>
        </div>
      </div>
    </div>
  );
}
function PoolInvest({ pool }: { pool: Pool }) {
  const walletBalances = useWalletBalances();
  const dispatch = useDispatch();
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const signer = useSelector((state: AppState) => state.web3.signer);
  const provider = useSelector((state: AppState) => state.web3.provider);
  const marketPrices = useMarketPrices();
  const tokenSet = useSelector((state: AppState) => state.web3.tokenSet);
  const network = useSelector((state: AppState) => state.web3.network);
  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const [transactionComplete, setTransactionComplete] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [tokensApproved, setTokensApproved] = useState(false);
  const [transactionError, setTransactionError] = useState('');
  const checkAndApproveAllowance = useCheckAndApproveTokenBalance();
  const [approvalHash, setApprovalHash] = useState<string>('');
  const [tokenAmounts, setTokenAmounts] = useState<string[]>([]);
  const [sumOfAmountsInFiat, setSumOfAmountsInFiat] = useState<string | null>(null);
  // const [tokenAmountMap, setTokenAmountMap] = useState<TokenAmountMap | undefined>(undefined);

  const initTokenAmounts = () => {
    setTokenAmounts(Array(pool.tokens.length).fill('0.0'));
  };
  useEffect(() => {
    if (!tokenAmounts.length) {
      initTokenAmounts();
    }
  }, [pool]);
  const walletBalanceGreaterThanZero = (token: PoolToken): boolean => {
    const bal = walletBalances[token.symbol as CryptoCurrencySymbol];
    return !bal || (bal && bal.balance.gt(0));
  };
  const getMarketPricesForPoolToken = (token: PoolToken): number => {
    const price = marketPrices.find((p) => p.symbol.toLowerCase() === token.symbol?.toLowerCase());
    if (price) {
      return price.current_price;
    }
    return 0;
  };

  const getUserBalanceForPoolToken = (token: PoolToken): BigNumber | undefined => {
    const bal = walletBalances[token.symbol as CryptoCurrencySymbol];
    return bal && bal.balance;
  };

  const handleTokenAmountChange = (tokenIndex: number, amount: string) => {
    const newTokenAmountMap = [...tokenAmounts];
    newTokenAmountMap[tokenIndex] = amount;
    setTokenAmounts(newTokenAmountMap);
  };

  useEffect(() => {
    if (!tokenAmounts.length) {
      setSumOfAmountsInFiat('0.0');
    }
    let total = 0;
    for (let i = 0; i < tokenAmounts.length; i++) {
      const amount = tokenAmounts[i];
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
    setSumOfAmountsInFiat(isNaN(total) ? null : total.toFixed(2));
  }, [tokenAmounts]);

  const join = async () => {
    if (userAddress && signer && tokenAmounts && provider && network) {
      try {
        const addressesSorted = pool.tokens.map((t) => t.address).sort();
        const amountsIn: string[] = [];
        const vaultAddress = getVaultAddress(network.chainId);
        setTransactionInProgress(true);
        for (let i = 0; i < addressesSorted.length; i++) {
          const address = addressesSorted[i];
          const decimals = pool.tokens.find((t) => t.address === address)?.decimals;
          const amount = ethers.utils.parseUnits(tokenAmounts[i], decimals).toString();
          amountsIn.push(amount);
          if (amount !== '0') {
            if (tokenAmounts[i] && parseFloat(tokenAmounts[i]) > 0) {
              await checkAndApproveAllowance(
                address,
                userAddress,
                setApprovalHash,
                MaxUint256,
                vaultAddress
              );
            }
          }
          setTokensApproved(true);
        }
        const gasResult = await getGasPrice(network.gasStationUrl);

        const tx = await joinPool(pool, userAddress, signer, amountsIn, gasResult?.fastest);
        setTransactionHash(tx.hash);
        await tx.wait(3);
        setTransactionComplete(true);
        dispatch(toggleBalancesAreStale(true));
        dispatch(toggleUserPoolDataStale(true));
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
    if (!tokenAmounts.length) {
      return false;
    }
    let nonZeroAmounts = 0;
    for (let i = 0; i < tokenAmounts.length; i++) {
      const amount = tokenAmounts[i];
      if (amountIsValidNumberGtZero(amount)) {
        nonZeroAmounts++;
        const amountBn = ethers.utils.parseUnits(amount, pool.tokens[i].decimals);
        const walletBalance =
          walletBalances[pool.tokens[i].symbol.toUpperCase() as CryptoCurrencySymbol];
        if (walletBalance && amountBn.gt(walletBalance.balance)) {
          return false;
        }
      }
    }
    if (nonZeroAmounts === 0) {
      return false;
    }
    if (sumOfAmountsInFiat === null) {
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
    const newTokenAmounts = [...tokenAmounts];
    for (let i = 0; i < newTokenAmounts.length; i++) {
      const token = pool.tokens[i];
      const balance = getUserBalanceForPoolToken(token);
      newTokenAmounts[i] = balance
        ? ethers.utils.formatUnits(balance.toString(), token.decimals)
        : '0';
    }
    setTokenAmounts(newTokenAmounts);
  };
  return (
    <div className={'flex flex-col'}>
      {tokenAmounts &&
        tokenAmounts.length > 0 &&
        pool.tokens.map((token, tokenIndex: number) => (
          <div key={token.symbol} className={'px-2'}>
            <SingleCryptoAmountInput
              disabled={!walletBalanceGreaterThanZero(token)}
              tokenPrice={getMarketPricesForPoolToken(token)}
              maxAmount={getUserBalanceForPoolToken(token)}
              amount={tokenAmounts[tokenIndex]}
              balance={getUserBalanceForPoolToken(token)}
              amountChanged={(amount: string) => handleTokenAmountChange(tokenIndex, amount)}
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
            onClick={join}
          >
            {BalancerFunction.Invest}
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
              {transactionComplete ? 'Join confirmed' : 'Join confirming'}
              <BlockExplorerLink transactionHash={transactionHash} />
            </TransactionStep>
            <TransactionError onClickClear={resetState} transactionError={transactionError} />
          </div>
        )}
      </div>
    </div>
  );
}
export default function PoolFunctions({ pool }: { pool: Pool }) {
  const [balancerFunction, setBalancerFunction] = useState<BalancerFunction>(
    BalancerFunction.Invest
  );
  return (
    <div className={'flex flex-col shadow rounded-2xl'}>
      <TabHeaderContainer>
        {[BalancerFunction.Invest, BalancerFunction.Withdraw].map((functionType, index) => (
          <TabHeader
            title={functionType}
            key={index}
            isActive={balancerFunction === functionType}
            onClick={() => setBalancerFunction(functionType)}
          />
        ))}
      </TabHeaderContainer>
      <DefaultTransition isOpen={balancerFunction === BalancerFunction.Invest}>
        <div>
          <PoolInvest pool={pool} />
        </div>
      </DefaultTransition>
      <DefaultTransition isOpen={balancerFunction === BalancerFunction.Withdraw}>
        <div>
          <PoolWithdraw pool={pool} />
        </div>
      </DefaultTransition>
    </div>
  );
}
