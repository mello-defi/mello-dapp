import { Amounts, OnchainPoolData, Pool, PoolToken, TokenInfoMap, UserPool } from '_interfaces/balancer';
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
  getVaultAddress, isStablePhantom,
  joinPool, propAmountsgiven
} from '_services/balancerService';
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { useEffect, useState } from 'react';
import useWalletBalances from '_hooks/useWalletBalances';
import { CryptoCurrencyName, CryptoCurrencySymbol } from '_enums/currency';
import SingleCryptoAmountInput from '_components/core/SingleCryptoAmountInput';
import useMarketPrices from '_hooks/useMarketPrices';
import { PolygonMainnetTokenContracts, TokenDefinition } from '_enums/tokens';
import { decimalPlacesAreValid, fixDecimalPlaces, getTokenByAddress } from '_utils/index';
import { getMarketDataForSymbol } from '_services/marketDataService';
import { HorizontalLineBreak } from '_components/core/HorizontalLineBreak';
import { Button } from '_components/core/Buttons';
import useCheckAndApproveTokenBalance from '_hooks/useCheckAndApproveTokenBalance';
import { getTokenValueInFiat } from '_services/priceService';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { StablePool } from '@georgeroman/balancer-v2-pools';
// import { initFromOnchain } from "@georgeroman/balancer-v2-pools/dist/src/initializers/stable";

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


  useEffect(() => {
    const val = singleAssetMaxes();
    console.log('SINGLE ASSET MAXES', val);
  }, [userPools, onChainData, poolAmounts])
  const singleAssetMaxes = () => {
    // if (isStablePhantom(pool.poolType)) return batchSwapSingleAssetMaxes.value;

    const btpBalance = userPools?.find((userPool) => userPool.poolId.address.toLowerCase() === pool.address.toLowerCase())?.balance;


    if (poolAmounts && onChainData && btpBalance && provider) {
      try {
        const amountsInbignuber: string[] = [];
        for (let i = 0; i < poolAmounts.receive.length; i++) {
          amountsInbignuber.push(ethers.utils.parseUnits(poolAmounts.receive[i], pool.tokens[i].decimals).toString());
        }
        // StablePool.initFromOnchain(provider, pool.id, 'polygon').then((stablepool) => {
        //   console.log('STABLEPOOL', stablepool);
        // })
        // StablePool.initFromSubgraph(pool.id, 'polygon').then((stabkepol) => {
        //   console.log('POOL', stabkepol);
        // })
        return [];
        // return pool.tokens.map((token, tokenIndex) => {
        //   console.log('*************************************************************\n\n')
        //   console.log(token.symbol);
        //   return formatUnits(
        //     exactBPTInForTokenOut(
        //       parseUnits(btpBalance, onChainData.decimals).toString(),
        //       tokenIndex,
        //       pool.poolType,
        //       amountsInbignuber,
        //       Object.values(onChainData.tokens).map((t) => t.weight.toString()),
        //       pool.tokens,
        //       onChainData.decimals,
        //       onChainData,
        //       parseUnits(onChainData?.totalSupply, onChainData.decimals).toString(),
        //       onChainData?.swapFee,
        //     )
        //       .toString(),
        //     token.decimals
        //   );
        // });
    } catch (error) {
      console.error(error);
      if ((error as Error).message.includes('MIN_BPT_IN_FOR_TOKEN_OUT')) {
        // setError(WithdrawalError.SINGLE_ASSET_WITHDRAWAL_MIN_BPT_LIMIT);
        return pool.tokens.map((token, tokenIndex) => {
          return formatUnits(
              exactBPTInForTokenOut(
                parseUnits(absMaxBpt(pool, onChainData, btpBalance), onChainData.decimals).toString(),
                tokenIndex,
                pool.poolType,
                poolAmounts?.receive,
                pool.tokens.map((t) => t.weight),
                pool.tokens,
                onChainData.decimals,
                onChainData,
                parseUnits(onChainData?.totalSupply, onChainData.decimals).toString(),
                onChainData?.swapFee,
              )
        .toString(),
            token.decimals
          );
        });
      }
      return [];
    }
    }

  }

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

        const tokenBalance = walletBalances[token.symbol]?.balance
        // }
        const price = marketPrices.find(m => m.symbol.toLowerCase() === token.symbol.toLowerCase())?.current_price;
        // @ts-ignore
        const f = getTokenValueInFiat(price, ethers.utils.formatUnits(tokenBalance, token.decimals))
        return f.toString();
      })
      .reduce((total, value) =>
        new AdvancedBigNumber(total)
          .plus(value)
          .toString()
      );

    return fiatValue;
  }
  useEffect(() => {
    if (provider && userPools){
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
            chainId: network.chainId,
          };
        }
        const poolTokenInfo = await getErc20TokenInfo(provider, pool.address);
        tokens[pool.address] = {
          ...poolTokenInfo,
          chainId: network.chainId
        }
        const btpBalance = userPools?.find((userPool) => userPool.poolId.address.toLowerCase() === pool.address.toLowerCase())?.balance;
        console.log('BTP BALANCE', btpBalance?.toString())
        const amounts = propAmountsgiven(pool.address, onchain, tokens, btpBalance?.toString() || '0', 0, 'send', 'exit');
        console.log(amounts)
        setPoolAmounts(amounts);
        setTotalPoolBalance(btpBalance?.toString() || '0');
      }
      aaa();
    }
  }, [userPools])
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
      {tokenAmountMap && poolAmounts &&
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
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const signer = useSelector((state: AppState) => state.web3.signer);
  const provider = useSelector((state: AppState) => state.web3.provider);
  const marketPrices = useMarketPrices();
  const tokenSet = useSelector((state: AppState) => state.web3.tokenSet);
  const network = useSelector((state: AppState) => state.web3.network);
  const checkAndApproveAllowance = useCheckAndApproveTokenBalance();
  const [approvalHash, setApprovalHash] = useState<string | null>(null);
  const [tokenAmountMap, setTokenAmountMap] = useState<TokenAmountMap | undefined>(undefined);

  useEffect(() => {
    if (!tokenAmountMap) {
      const freshTokenMap: TokenAmountMap = {};
      for (const token of pool.tokens) {
        freshTokenMap[token.address] = '0.0';
      }
      setTokenAmountMap(freshTokenMap);
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

  const join = async () => {
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
        await joinPool(pool, userAddress, signer, amountsIn, gasResult?.fastest);
      } catch (e: any) {
        console.error(e);
      }
    }
  };

  return (
    <div className={'flex flex-col'}>
      {tokenAmountMap &&
        pool.tokens.map((token) => (
          <div key={token.symbol} className={'px-2'}>
            <SingleCryptoAmountInput
              disabled={!walletBalanceGreaterThanZero(token)}
              tokenPrice={getMarketPricesForPoolToken(token)}
              amount={tokenAmountMap[token.address]}
              balance={getUserBalanceForPoolToken(token)}
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
          <Button className={'w-full'} onClick={join}>
            {BalancerFunction.Invest}
          </Button>
        </div>
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
      <ul className="font-medium  cursor-pointer text-center text-color-light text-body-smaller divide-x divide-gray-200 flex ">
        <li onClick={() => setBalancerFunction(BalancerFunction.Invest)} className="w-full">
          <span
            className={`${
              balancerFunction === BalancerFunction.Invest ? 'text-black bg-gray-100' : ''
            } rounded-tl-2xl inline-block p-4 w-full bg-white hover:text-gray-700 hover:bg-gray-50 focus:ring-4 focus:ring-blue-300 focus:outline-none`}
          >
            Invest
          </span>
        </li>
        <li onClick={() => setBalancerFunction(BalancerFunction.Withdraw)} className="w-full">
          <span
            className={`${
              balancerFunction === BalancerFunction.Withdraw ? 'text-black bg-gray-100' : ''
            } inline-block rounded-tr-2xl p-4 w-full bg-white hover:text-gray-700 hover:bg-gray-50 focus:ring-4 focus:ring-blue-300 focus:outline-none`}
          >
            Withdraw
          </span>
        </li>
      </ul>
      {balancerFunction === BalancerFunction.Invest && <PoolInvest pool={pool} />}
      {balancerFunction === BalancerFunction.Withdraw && <PoolWithdraw pool={pool} />}
      {/*<PoolInvest pool={pool}/>*/}
    </div>
  );
}
