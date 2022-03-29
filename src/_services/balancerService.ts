import { ApolloClient, DefaultOptions, gql, InMemoryCache } from '@apollo/client';
import { pick } from 'lodash';

import {
  Amounts,
  LinearPoolDataMap,
  LiquidityMiningPoolResult,
  LiquidityMiningTokenReward,
  OnchainPoolData,
  OnchainTokenDataMap,
  Pool,
  PoolToken,
  PoolType, QueryExitResponse,
  RawLinearPoolData,
  RawLinearPoolDataMap,
  RawOnchainPoolData,
  RawPoolTokens,
  TokenInfoMap,
  UserPool
} from '_interfaces/balancer';
import axios from 'axios';
import { differenceInWeeks } from 'date-fns';
import { BigNumber, BigNumberish, Contract, ethers } from 'ethers';
import { BigNumber as AdvancedBigNumber } from '@aave/protocol-js';
import { getTokenByAddress } from '_utils/index';
import { MarketDataResult } from '_services/marketDataService';
import { GenericTokenSet } from '_enums/tokens';
import {
  BalancerHelpers__factory,
  StablePool__factory,
  Vault__factory,
  WeightedPool__factory
} from '@balancer-labs/typechain';
import { ERC20Abi, ProtocolFeeCollectorAbi } from '_abis';
import { toUtcTime, twentyFourHoursInSecs } from '_utils/time';
import { StablePoolEncoder, toNormalizedWeights, WeightedPoolEncoder } from '@balancer-labs/sdk';
import { MaxUint256 } from '_utils/maths';
import { TransactionRequest, TransactionResponse } from '@ethersproject/abstract-provider';
import { WalletTokenBalances } from '_redux/types/walletTypes';
import { multicall } from '_services/walletService';
import { formatUnits, getAddress, parseUnits } from 'ethers/lib/utils';
import { InvestmentPoolEncoder } from '@balancer-labs/balancer-js';
import { getUserPoolsAprs } from '_redux/effects/balancerEffects';
// import { exitExactBptInForTokenOut } from '@georgeroman/balancer-v2-pools/dist/src/utils/test/pools/query';
// import { _calcTokenOutGivenExactBptIn } from '@georgeroman/balancer-v2-pools/dist/src/pools/stable/math';

const liquidityMiningStartTime = Date.UTC(2020, 5, 1, 0, 0);
// TODO store in some network config
const polygonVaultAddress = '0xBA12222222228d8Ba445958a75a0704d566BF2C8';
const polygonHelperAddress = '0x239e55F427D44C3cc793f49bFB507ebe76638a2b';
const MINIMUM_LIQUIDITY = '1000000';

const GET_USER_POOLS = gql`
  query getUserPools($userAddress: String!) {
    poolShares(
      where: { userAddress: $userAddress, balance_gt: 0 }
      orderBy: balance
      orderDirection: desc,
      where:{ poolType_in: ["Weighted", "Stable"]}
    ) {
      id
      poolId {
        id
        address
        poolType
        totalLiquidity
        strategyType
        totalSwapFee
        totalShares
        swapFee
        symbol
        amp
        tokens {
          id
          symbol
          name
          decimals
          address
          priceRate
          balance
          invested
          investments {
            id
            amount
          }
          weight
        }
      }
      balance
    }
  }
`;

const GET_PAST_POOL_FOR_ID = gql`
  query GetPools($block: Int!, $poolId: String!) {
    pools(where: { id: $poolId }, block: { number: $block }) {
      id
      address
      poolType
      totalLiquidity
      strategyType
      totalShares
      totalSwapFee
      swapFee
      symbol
      amp
      tokens {
        id
        symbol
        name
        decimals
        address
        balance
        invested
        priceRate
        investments {
          id
          amount
        }
        weight
      }
    }
  }
`;
const GET_ALL_POOLS = gql`
  query GetPools($minimumLiquidity: String!) {
    pools(
    first: 1000, 
    skip: 0, 
    orderBy: totalLiquidity,
    orderDirection: desc,
    where: { 
      poolType_in: ["Weighted", "Stable"],
      totalLiquidity_gte: $minimumLiquidity,
    }) {
      id
      address
      poolType
      totalLiquidity
      strategyType
      totalSwapFee
      swapFee
      totalShares
      symbol
      amp
      tokens{
        id
        symbol
        name
        decimals
        priceRate
        address
        balance
        invested
        investments {
          id
          amount
        }
        weight
      }
    }
  }
`;

const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'ignore'
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all'
  }
};
const client = new ApolloClient({
  // TODO make network specific
  uri: 'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-polygon-v2',
  cache: new InMemoryCache({ resultCaching: false }),
  defaultOptions
});

function getCurrentLiquidityMiningWeek() {
  return differenceInWeeks(toUtcTime(new Date()), liquidityMiningStartTime) + 1;
}

function bnum(val: string | number | BigNumber): AdvancedBigNumber {
  const number = typeof val === 'string' ? val : val ? val.toString() : '0';
  return new AdvancedBigNumber(number);
}

const getPriceForAddress = (
  tokenSet: GenericTokenSet,
  prices: MarketDataResult[],
  address: string
): number => {
  try {
    const token = getTokenByAddress(tokenSet, address);
    const p = prices.find(
      (p: MarketDataResult) => p.symbol.toLowerCase() === token.symbol.toLowerCase()
    );
    return p ? p.current_price : 0;
  } catch (e: any) {
    console.log(e);
  }
  return 0;
};

function computeAPRForPool(
  rewards: number,
  tokenPrice: number | null | undefined,
  totalLiquidity: string
) {
  // Guard against null price
  if (tokenPrice === null || tokenPrice === undefined) return '0';
  return bnum(rewards).div(7).times(tokenPrice).times(365).div(totalLiquidity).toString();
}

function computeTotalAPRForPool(
  tokenRewards: LiquidityMiningTokenReward[],
  totalLiquidity: string,
  marketPrices: MarketDataResult[],
  tokenSet: GenericTokenSet
) {
  return tokenRewards
    .reduce(
      (totalRewards: AdvancedBigNumber, { amount, tokenAddress }) =>
        totalRewards.plus(
          computeAPRForPool(
            amount,
            getPriceForAddress(tokenSet, marketPrices, tokenAddress),
            totalLiquidity
          )
        ),
      bnum(0)
    )
    .toString();
}

const getBlockNum = async (provider: ethers.providers.Web3Provider): Promise<number> => {
  const currentBlock = await provider.getBlockNumber();
  const blocksInDay = Math.round(twentyFourHoursInSecs / 2);
  return currentBlock - blocksInDay;
};

const getPastPools = async (
  poolId: string,
  provider: ethers.providers.Web3Provider
): Promise<Pool> => {
  const blockNum = await getBlockNum(provider);
  const poolResults = await client.query({
    query: GET_PAST_POOL_FOR_ID,
    variables: { block: blockNum, poolId }
  });
  return poolResults.data ? poolResults.data.pools[0] : null;
};

function getReadVaultContract(provider: ethers.providers.Web3Provider): Contract {
  return new Contract(polygonVaultAddress, Vault__factory.abi, provider);
}

function getWriteVaultContract(signer: ethers.Signer): Contract {
  return new Contract(polygonVaultAddress, Vault__factory.abi, signer);
}
export async function getSwapApr(
  pool: Pool,
  provider: ethers.providers.Web3Provider,
  signer: ethers.Signer
): Promise<number> {
  const pastPool = await getPastPools(pool.id, provider);
  const vault: Contract = getWriteVaultContract(signer);
  const collectorAddress = await vault.getProtocolFeesCollector();
  const collector = new Contract(collectorAddress, ProtocolFeeCollectorAbi, signer);
  const swapFeePercentage = await collector.getSwapFeePercentage();
  const protocolFeePercentage = swapFeePercentage / 10 ** 18;
  let poolApr: AdvancedBigNumber | string = '';
  if (!pastPool) {
    poolApr = bnum(pool.totalSwapFee)
      .times(1 - protocolFeePercentage)
      .dividedBy(pool.totalLiquidity)
      .multipliedBy(365);
  } else {
    const swapFees = bnum(pool.totalSwapFee).minus(pastPool.totalSwapFee);
    poolApr = swapFees
      .times(1 - protocolFeePercentage)
      .dividedBy(pool.totalLiquidity)
      .multipliedBy(365);
  }
  return Number(poolApr.times(100).toFixed(2));
}

export async function getMiningLiquidityApr(
  tokenSet: GenericTokenSet,
  pool: Pool,
  marketPrices: MarketDataResult[]
): Promise<number> {
  let liquidityMiningAPR = '0';
  const url =
    'https://raw.githubusercontent.com/balancer-labs/frontend-v2/develop/src/lib/utils/liquidityMining/MultiTokenLiquidityMining.json';
  const { data } = await axios.get(url);
  const week = `week_${getCurrentLiquidityMiningWeek()}`;
  const weekStats: LiquidityMiningPoolResult[] | undefined = data[week];
  let liquidityMiningRewards: LiquidityMiningTokenReward[] = [];

  if (weekStats) {
    const rewards = weekStats.find((p: LiquidityMiningPoolResult) => p.chainId === 137)?.pools;
    if (rewards && rewards[pool.id]) {
      liquidityMiningRewards = rewards[pool.id];
    }
  }

  const miningTotalLiquidity = bnum(pool.totalLiquidity).toString();
  const IS_LIQUIDITY_MINING_ENABLED = true;
  const hasLiquidityMiningRewards = IS_LIQUIDITY_MINING_ENABLED
    ? !!liquidityMiningRewards.length
    : false;
  if (hasLiquidityMiningRewards) {
    console.log(pool.id);
    liquidityMiningAPR = computeTotalAPRForPool(
      liquidityMiningRewards,
      miningTotalLiquidity,
      marketPrices,
      tokenSet
    );
  }
  return Number(bnum(liquidityMiningAPR).times(100).toFixed(2));
}

export async function getUserPools(userAddress: string): Promise<UserPool[]> {
  const userPools = await client.query({
    query: GET_USER_POOLS,
    variables: { userAddress: userAddress.toLowerCase() }
  });
  return userPools.data ? userPools.data.poolShares : [];
}

export function getVaultAddress(chainId: number): string {
  return polygonVaultAddress;
}

export async function getPools(addresses: string[]): Promise<Pool[]> {
  const addressesLowercase = addresses.map(address => address.toLowerCase());
  const poolResults = await client.query({
    query: GET_ALL_POOLS,
    variables: {
      minimumLiquidity: MINIMUM_LIQUIDITY,
    }
  });
  if (!poolResults.data) {
    return [];
  }

  return poolResults.data.pools.filter((pool: Pool) => {
    const tokenAddresses = pool.tokens.map((token: PoolToken) => token.address.toLowerCase());
    return tokenAddresses.filter(address => addressesLowercase.includes(address)).length === tokenAddresses.length;
  });
}

export async function joinPool(
  pool: Pool,
  userAddress: string,
  signer: ethers.Signer,
  amountsIn: string[],
  gasPrice?: BigNumber
): Promise<TransactionResponse> {
  const vault: Contract = getWriteVaultContract(signer);
  const options: TransactionRequest = {};
  if (gasPrice) {
    options.gasPrice = gasPrice.toString();
  }
  let userData: string;
  if (isStable(pool.poolType)) {
    userData = StablePoolEncoder.joinExactTokensInForBPTOut(amountsIn, BigNumber.from('0'))
  } else {
    userData = WeightedPoolEncoder.joinExactTokensInForBPTOut(amountsIn, BigNumber.from('0'))
  }
  return await vault.joinPool(
    pool.id,
    userAddress,
    userAddress,
    {
      assets: pool.tokens.map((t: PoolToken) => t.address),
      maxAmountsIn: amountsIn,
      fromInternalBalance: false,
      userData,
    },
    options
  );
}

export async function exitPool(
  pool: Pool,
  userAddress: string,
  signer: ethers.Signer,
  amountsOut: string[],
  gasPrice?: BigNumber
): Promise<TransactionResponse> {
  const vault: Contract = getWriteVaultContract(signer);
  const options: TransactionRequest = {};
  if (gasPrice) {
    options.gasPrice = gasPrice.toString();
  }
  return await vault.exitPool(
    pool.id,
    userAddress,
    userAddress,
    {
      assets: pool.tokens.map((t: PoolToken) => t.address),
      minAmountsOut: amountsOut,
      fromInternalBalance: false,
      userData: StablePoolEncoder.exitBPTInForExactTokensOut(amountsOut, MaxUint256)
    },
    options
  );
}

function getAbiForPoolType(poolType: PoolType) {
  switch (poolType) {
    case PoolType.Stable:
      return StablePool__factory.abi;
    case PoolType.Weighted:
      return WeightedPool__factory.abi;
    default:
      throw new Error(`Unsupported pool type: ${poolType}`);
  }
}

export function isStable(poolType: PoolType): boolean {
  return poolType === PoolType.Stable;
}

export function isWeighted(poolType: PoolType): boolean {
  return poolType === PoolType.Weighted;
}

function normalizeWeights(weights: BigNumber[], type: PoolType, tokens: TokenInfoMap): number[] {
  if (isWeighted(type)) {
    return toNormalizedWeights(weights).map((w) => Number(ethers.utils.formatUnits(w, 18)));
  } else if (isStable(type)) {
    const tokensList = Object.values(tokens);
    return tokensList.map(() => 1 / tokensList.length);
  } else {
    return [];
  }
}

function formatPoolTokens(
  poolTokens: RawPoolTokens,
  tokenInfo: TokenInfoMap,
  weights: number[],
  poolAddress: string
): OnchainTokenDataMap {
  const tokens = <OnchainTokenDataMap>{};

  poolTokens.tokens.forEach((token, i) => {
    const tokenBalance = poolTokens.balances[i];
    const tokenAddressLowercase = token.toLowerCase();
    const decimals = tokenInfo[tokenAddressLowercase]?.decimals;
    tokens[tokenAddressLowercase] = {
      decimals,
      balance: formatUnits(tokenBalance, decimals),
      weight: weights[i],
      // @ts-ignore
      symbol: tokenInfo[tokenAddressLowercase]?.symbol,
      name: tokenInfo[tokenAddressLowercase]?.name,
      logoURI: undefined
    };
  });

  // Remove pre-minted BPT
  delete tokens[poolAddress];

  return tokens;
}

function formatLinearPools(linearPools: RawLinearPoolDataMap): LinearPoolDataMap {
  const _linearPools = <LinearPoolDataMap>{};

  Object.keys(linearPools).forEach((address) => {
    const {
      id,
      mainToken,
      wrappedToken,
      priceRate,
      unwrappedTokenAddress,
      tokenData,
      totalSupply
    } = linearPools[address];

    _linearPools[address] = {
      id,
      priceRate: formatUnits(priceRate.toString(), 18),
      mainToken: {
        address: getAddress(mainToken.address),
        index: mainToken.index.toNumber(),
        balance: tokenData.balances[mainToken.index.toNumber()].toString()
      },
      wrappedToken: {
        address: getAddress(wrappedToken.address),
        index: wrappedToken.index.toNumber(),
        balance: tokenData.balances[wrappedToken.index.toNumber()].toString(),
        priceRate: formatUnits(wrappedToken.rate, 18)
      },
      unwrappedTokenAddress: getAddress(unwrappedTokenAddress),
      totalSupply: formatUnits(totalSupply, 18)
    };
  });

  return _linearPools;
}

function formatPoolData(
  rawData: RawOnchainPoolData,
  type: PoolType,
  tokens: TokenInfoMap,
  poolAddress: string
): OnchainPoolData {
  const poolData = <OnchainPoolData>{};

  // Filter out pre-minted BPT token if exists
  const validTokens = Object.keys(tokens).filter((address) => address !== poolAddress);
  tokens = pick(tokens, validTokens);

  const normalizedWeights = normalizeWeights(rawData?.weights || [], type, tokens);

  poolData.tokens = formatPoolTokens(rawData.poolTokens, tokens, normalizedWeights, poolAddress);

  poolData.amp = '0';
  if (rawData?.amp) {
    poolData.amp = rawData.amp.value.div(rawData.amp.precision).toString();
  }

  poolData.swapEnabled = true;
  if (rawData.swapEnabled !== undefined) {
    poolData.swapEnabled = rawData.swapEnabled;
  }

  if (rawData?.linearPools) {
    poolData.linearPools = formatLinearPools(rawData.linearPools);
  }

  if (rawData.tokenRates) {
    poolData.tokenRates = rawData.tokenRates.map((rate) =>
      ethers.utils.formatUnits(rate.toString(), 18)
    );
  }

  poolData.totalSupply = ethers.utils.formatUnits(rawData.totalSupply, rawData.decimals);
  poolData.decimals = rawData.decimals;
  poolData.swapFee = ethers.utils.formatUnits(rawData.swapFee, 18);

  return poolData;
}

export async function getPoolOnChainData(
  pool: Pool,
  provider: ethers.providers.Web3Provider
): Promise<OnchainPoolData> {
  let paths: string[] = ['totalSupply', 'decimals', 'swapFee'];
  let calls: any[] = [
    // totalSupply
    [pool.address, 'totalSupply', []],
    // decimals
    [pool.address, 'decimals', []],
    // swapFee
    [pool.address, 'getSwapFeePercentage', []]
  ];

  if (isWeighted(pool.poolType)) {
    paths.push('weights');
    calls.push([pool.address, 'getNormalizedWeights', []]);
  } else if (isStable(pool.poolType)) {
    paths.push('amp');
    calls.push([pool.address, 'getAmplificationParameter', []]);
  }

  let result: RawOnchainPoolData = await multicall(
    provider,
    paths,
    calls,
    getAbiForPoolType(pool.poolType)
  );
  // const onChainData: OnchainPoolData = {};
  paths = [];
  calls = [];
  if (isStable(pool.poolType) && result.linearPools) {
    const wrappedTokensMap: Record<string, string> = {};

    Object.keys(result.linearPools).forEach((address) => {
      if (!result.linearPools) return;
      const linearPool: RawLinearPoolData = result.linearPools[address];

      paths.push(`linearPools.${address}.tokenData`);
      calls.push([pool.address, 'getPoolTokens', [linearPool.id]]);

      wrappedTokensMap[address] = linearPool.wrappedToken.address;
    });

    Object.entries(wrappedTokensMap).forEach(([address, wrappedToken]) => {
      paths.push(`linearPools.${address}.unwrappedTokenAddress`);
      calls.push([wrappedToken, 'ATOKEN', []]);
      paths.push(`linearPools.${address}.totalSupply`);
      calls.push([address, 'getVirtualSupply', []]);
    });
    const result2 = await multicall(provider, paths, calls, getAbiForPoolType(pool.poolType));
    result = {
      ...result,
      ...result2
    };
  }

  const vaultContract = getReadVaultContract(provider);
  const pt: RawPoolTokens = await vaultContract.getPoolTokens(pool.id);
  result = {
    ...result,
    poolTokens: pt
  };

  const tokens: TokenInfoMap = {};
  for (const token of pool.tokens) {
    tokens[token.address.toLowerCase()] = {
      ...token,
      chainId: 137
    };
  }
  return formatPoolData(result, pool.poolType, tokens, pool.address);
}

function poolTokenDecimals(onchain: OnchainPoolData, index: number): number {
  return Object.values(onchain.tokens).map((t) => t.decimals)[index];
}

function poolTokenBalances(onchain: OnchainPoolData): BigNumber[] {
  const normalizedBalances = Object.values(onchain.tokens).map((t) => t.balance);
  return normalizedBalances.map((balance, i) => parseUnits(balance, poolTokenDecimals(onchain, i)));
}

function poolDecimals(onchain: OnchainPoolData): number {
  return onchain.decimals;
}

function poolTotalSupply(onchain: OnchainPoolData): BigNumber {
  return parseUnits(onchain.totalSupply, poolDecimals(onchain));
}

function sendRatios(action: string, onchain: OnchainPoolData): BigNumberish[] {
  if (action === 'join') return poolTokenBalances(onchain);
  return [poolTotalSupply(onchain)];
}

function receiveRatios(action: string, onchain: OnchainPoolData): BigNumberish[] {
  if (action === 'join') return [poolTotalSupply(onchain)];
  return poolTokenBalances(onchain);
}

function ratioOf(action: string, type: string, index: number, onchain: OnchainPoolData) {
  if (type === 'send') {
    return sendRatios(action, onchain)[index];
  } else {
    return receiveRatios(action, onchain)[index];
  }
}

function tokenAddresses(onchain: OnchainPoolData): string[] {
  // if (this.useNativeAsset.value) {
  //   return this.pool.value.tokenAddresses.map(address => {
  //     if (address === this.config.network.addresses.weth)
  //       return this.config.network.nativeAsset.address;
  //     return address;
  //   });
  // }
  return Object.keys(onchain.tokens);
}

function sendTokens(action: string, onchain: OnchainPoolData, poolAddress: string): string[] {
  if (action === 'join') return tokenAddresses(onchain);
  return [poolAddress];
}

function receiveTokens(action: string, onchain: OnchainPoolData, poolAddress: string): string[] {
  if (action === 'join') return [poolAddress];
  return tokenAddresses(onchain);
}

function tokenOf(
  action: string,
  type: string,
  index: number,
  onchain: OnchainPoolData,
  poolAddress: string
) {
  if (type === 'send') {
    return sendTokens(action, onchain, poolAddress)[index];
  } else {
    return receiveTokens(action, onchain, poolAddress)[index];
  }
}

export function absMaxBpt(pool: Pool, onchain: OnchainPoolData, bptBalance: string): string {
  if (!isWeighted(pool.poolType)) return bptBalance;
  // Maximum BPT allowed from weighted pool is 30%
  const poolMax = bnum(pool.totalShares)
    .times(0.3)
    .toFixed(onchain.decimals, AdvancedBigNumber.ROUND_DOWN);
  // If the user's bpt balance is greater than the withdrawal limit for
  // weighted pools we need to return the poolMax bpt value.
  return AdvancedBigNumber.min(bptBalance, poolMax).toString();
}
export async function exactBPTInForTokenOut(
  bptAmount: string,
  tokenIndex: number,
  poolType: PoolType,
  poolTokens: PoolToken[],
  provider: ethers.providers.Web3Provider,
  poolId: string,
  userAddress: string
): Promise<BigNumber> {
  if (bnum(bptAmount).eq(0)) {
    BigNumber.from(0);
  }
  const contract = new Contract(
    polygonHelperAddress,
    BalancerHelpers__factory.abi,
    provider
  );
  let userData: string;
  if (isStable(poolType)) {
    userData = StablePoolEncoder.exitExactBPTInForOneTokenOut(bptAmount, tokenIndex);
  } else {
    userData = WeightedPoolEncoder.exitExactBPTInForOneTokenOut(bptAmount, tokenIndex);
  }
  const response: QueryExitResponse = await contract.queryExit(poolId, userAddress, userAddress, {
    assets: poolTokens.map((t) => t.address),
    minAmountsOut: [0, 0, 0, 0],
    userData,
    toInternalBalance: false
  });
  return response.amountsOut[tokenIndex];
}

export function propAmountsgiven(
  poolAddress: string,
  onchain: OnchainPoolData,
  tokenInfoMap: TokenInfoMap,
  fixedAmount: string,
  index: number,
  type: 'send' | 'receive',
  action: 'join' | 'exit'
): Amounts {
  if (fixedAmount.trim() === '') return { send: [], receive: [], fixedToken: 0 };

  const types = ['send', 'receive'];
  const fixedTokenAddress = tokenOf(action, type, index, onchain, poolAddress.toLowerCase());
  const fixedToken = tokenInfoMap[fixedTokenAddress.toLowerCase()];
  const fixedDenormAmount = parseUnits(fixedAmount, fixedToken.decimals);
  const fixedRatio = ratioOf(action, type, index, onchain);
  const amounts = {
    send: sendTokens(action, onchain, poolAddress.toLowerCase()).map(() => ''),
    receive: receiveTokens(action, onchain, poolAddress.toLowerCase()).map(() => ''),
    fixedToken: index
  };
  amounts[type][index] = fixedAmount;

  [sendRatios(action, onchain), receiveRatios(action, onchain)].forEach((ratios, ratioType) => {
    ratios.forEach((ratio, i) => {
      if (i !== index || type !== types[ratioType]) {
        const tokenAddress = tokenOf(
          action,
          types[ratioType],
          i,
          onchain,
          poolAddress.toLowerCase()
        );
        const token = tokenInfoMap[tokenAddress.toLowerCase()];
        // @ts-ignore
        amounts[types[ratioType]][i] = formatUnits(
          fixedDenormAmount.mul(ratio).div(fixedRatio),
          token.decimals
        );
      }
    });
  });
  return amounts;
}

export function calculateUserSharesInFiat(pool: Pool, userPool: UserPool): string {
  return new AdvancedBigNumber(pool.totalLiquidity)
    .div(pool.totalShares)
    .times(userPool.balance)
    .toString();
}
