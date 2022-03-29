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

import { approveToken, getErc20TokenInfo, getTokenAllowance } from '_services/walletService';
import { ERC20Abi } from '../../_abis';
import { getGasPrice } from '_services/gasService';
import { MaxUint256 } from '_utils/maths';
import { logTransactionHash } from '_services/dbService';
import {
  absMaxBpt,
  exactBPTInForTokenOut,
  exitPool,
  getPoolOnChainData,
  getUserPools,
  getVaultAddress,
  joinPool,
  propAmountsgiven
} from '_services/balancerService';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import React, { useEffect, useState } from 'react';
import useWalletBalances from '_hooks/useWalletBalances';
import { CryptoCurrencyName, CryptoCurrencySymbol } from '_enums/currency';
import SingleCryptoAmountInput from '_components/core/SingleCryptoAmountInput';
import useMarketPrices from '_hooks/useMarketPrices';
import { EvmTokenDefinition, PolygonMainnetTokenContracts, TokenDefinition } from '_enums/tokens';
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
import { getTokenValueInFiat } from '_services/priceService';
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

export enum BalancerFunction {
  Invest = 'Invest',
  Withdraw = 'Withdraw'
}

interface TokenAmountMap {
  [address: string]: string;
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
  const [tokenAmountMap, setTokenAmountMap] = useState<TokenAmountMap | undefined>(undefined);
  const [onChainData, setOnchain] = useState<OnchainPoolData | undefined>(undefined);
  const [userPools, setUserPools] = useState<UserPool[] | undefined>(undefined);
  const [poolAmounts, setPoolAmounts] = useState<Amounts | undefined>();
  const [singleAssetMaxes, setSingleAssetMaxes] = useState<string[] | undefined>();

  useEffect(() => {
    // if (!singleAssetMaxes || singleAssetMaxes.length === 0) {
    async function doStuff() {
      const maxes = await getSingleAssetMaxes();
      console.log(maxes);
      setSingleAssetMaxes(maxes);
    }
    doStuff();
    // }
  }, [userPools, onChainData, poolAmounts]);
  const getSingleAssetMaxes = async (): Promise<string[]> => {
    const btpBalance = userPools?.find(
      (userPool) => userPool.poolId.address.toLowerCase() === pool.address.toLowerCase()
    )?.balance;
    if (poolAmounts && onChainData && btpBalance && provider && userAddress) {
      try {
        const amounts = [];
        for (let i = 0; i < pool.tokens.length; i++) {
          const token = pool.tokens[i];
          // console.log(exactBPTInForTokenOut);
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
              parseUnits(
                absMaxBpt(pool, onChainData, btpBalance),
                onChainData.decimals
              ).toString(),
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
    if (!tokenAmountMap) {
      const freshTokenMap: TokenAmountMap = {};
      for (const token of pool.tokens) {
        freshTokenMap[token.address] = '0.0';
      }
      setTokenAmountMap(freshTokenMap);
    }
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
        // console.log('CAN IVST AMOUNT', canInvestAmount())
        // console.log(poolData);
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
        console.log('BTP BALANCE', btpBalance?.toString());
        const amounts = propAmountsgiven(
          pool.address,
          onchain,
          tokens,
          btpBalance?.toString() || '0',
          0,
          'send',
          'exit'
        );
        console.log(amounts);
        setPoolAmounts(amounts);
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

  const handleTokenAmountChange = (token: PoolToken, amount: string) => {
    const newTokenAmountMap = { ...tokenAmountMap };
    newTokenAmountMap[token.address] = amount;
    setTokenAmountMap(newTokenAmountMap);
  };

  const calculateInvestTotal = (): number | string => {
    if (!tokenAmountMap) {
      return '0.0';
    }
    let total = 0;
    for (const token of pool.tokens) {
      const amount = tokenAmountMap[token.address];
      const tokenData = getTokenByAddress(tokenSet, token.address);
      const data = getMarketDataForSymbol(marketPrices, tokenData.symbol);
      if (data) {
        const price = data && data.current_price;
        total += price * parseFloat(amount);
      }
    }
    return total;
  };

  const exit = async () => {
    if (userAddress && signer && tokenAmountMap && provider && network) {
      try {
        const addressesSorted = pool.tokens.map((t) => t.address).sort();
        const amountsIn: string[] = [];
        const vaultAddress = getVaultAddress(network.chainId);
        for (const address of addressesSorted) {
          const decimals = pool.tokens.find((t) => t.address === address)?.decimals;
          const amount = ethers.utils.parseUnits(tokenAmountMap[address], decimals).toString();
          amountsIn.push(amount);
          if (amount !== '0') {
            if (tokenAmountMap[address] && parseFloat(tokenAmountMap[address]) > 0) {
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
      {onChainData && (
        <div className={'px-2'}>
          <TokenSelectDropdown
            tokenFilter={(t) =>
              Object.keys(onChainData.tokens)
                .map((address: string) => address.toLowerCase())
                .includes(t.address.toLowerCase())
            }
            onSelectToken={(token: EvmTokenDefinition) => {
              console.log(token);
            }}
            disabled={false}
          />
        </div>
      )}
      {tokenAmountMap &&
        poolAmounts &&
        pool.tokens.map((token, index: number) => (
          <div key={token.symbol} className={'px-2'}>
            <SingleCryptoAmountInput
              disabled={false}
              tokenPrice={getMarketPricesForPoolToken(token)}
              amount={tokenAmountMap[token.address]}
              balance={ethers.utils.parseUnits(poolAmounts?.receive[index], token.decimals)}
              amountChanged={(amount: string) => handleTokenAmountChange(token, amount)}
              token={getTokenByAddress(tokenSet, token.address)}
            />
          </div>
        ))}

      <div className={'px-4 mt-2'}>
        <HorizontalLineBreak />
        <div className={'flex-row-center justify-between text-body'}>
          <div>Total:</div>
          <div className={'font-mono'}>${calculateInvestTotal()}</div>
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
      const token = pool.tokens[i];
      const tokenData = getTokenByAddress(tokenSet, token.address);
      const data = getMarketDataForSymbol(marketPrices, tokenData.symbol);
      if (data) {
        const price = data && data.current_price;
        total += price * parseFloat(amount);
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
      {/*{balancerFunction === BalancerFunction.Invest && <PoolInvest pool={pool} />}*/}
      {/*{balancerFunction === BalancerFunction.Withdraw && <PoolWithdraw pool={pool} />}*/}
      {/*<PoolInvest pool={pool}/>*/}
    </div>
  );
}
