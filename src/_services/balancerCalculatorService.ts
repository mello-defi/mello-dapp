import {
  Amounts,
  LiquidityMiningPoolResult,
  LiquidityMiningTokenReward,
  OnchainPoolData,
  Pool,
  PoolToken,
  QueryExitResponse,
  TokenInfoMap,
  UserPool
} from '_interfaces/balancer';
import axios from 'axios';
import { differenceInWeeks } from 'date-fns';
import { BigNumber, BigNumberish, Contract, ethers } from 'ethers';
import { BigNumber as AdvancedBigNumber } from '@aave/protocol-js';
import { getTokenByAddress } from '_utils/index';
import { GenericTokenSet } from '_enums/tokens';
import { ProtocolFeeCollectorAbi } from '_abis';
import { toUtcTime } from '_utils/time';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { getPastPools } from '_services/balancerSubgraphClient';
import { getReadVaultContract } from '_services/balancerVaultService';
import { PoolType, StablePoolEncoder, WeightedPoolEncoder } from '_enums/balancer';
import { BalancerHelpers__factory } from '@balancer-labs/typechain';
import { NetworkMarketData } from '_services/marketDataService';

const liquidityMiningStartTime = Date.UTC(2020, 5, 1, 0, 0);
const polygonHelperAddress = '0x239e55F427D44C3cc793f49bFB507ebe76638a2b';

function getCurrentLiquidityMiningWeek() {
  return differenceInWeeks(toUtcTime(new Date()), liquidityMiningStartTime) + 1;
}

function bnum(val: string | number | BigNumber): AdvancedBigNumber {
  const number = typeof val === 'string' ? val : val ? val.toString() : '0';
  return new AdvancedBigNumber(number);
}

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
  marketPrices: NetworkMarketData
) {
  return tokenRewards
    .reduce(
      (totalRewards: AdvancedBigNumber, { amount, tokenAddress }) =>
        totalRewards.plus(
          computeAPRForPool(
            amount,
            marketPrices[tokenAddress] ? marketPrices[tokenAddress.toLowerCase()] : null,
            totalLiquidity
          )
        ),
      bnum(0)
    )
    .toString();
}

export async function getSwapApr(
  pool: Pool,
  provider: ethers.providers.Web3Provider,
  signer: ethers.Signer
): Promise<number> {
  const pastPool = await getPastPools(pool.id, provider);
  const vault: Contract = getReadVaultContract(provider);
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
  pool: Pool,
  marketPrices: NetworkMarketData
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
    liquidityMiningAPR = computeTotalAPRForPool(
      liquidityMiningRewards,
      miningTotalLiquidity,
      marketPrices
    );
  }
  return Number(bnum(liquidityMiningAPR).times(100).toFixed(2));
}

export function isStable(poolType: PoolType): boolean {
  return poolType === PoolType.Stable;
}

export function isWeighted(poolType: PoolType): boolean {
  return poolType === PoolType.Weighted;
}

function poolTokenDecimals(onchain: OnchainPoolData, index: number): number {
  return Object.values(onchain.tokens).map((t) => t.decimals)[index];
}

function poolTokenBalances(onchain: OnchainPoolData): BigNumber[] {
  const normalizedBalances = Object.values(onchain.tokens).map((t) => t.balance);
  return normalizedBalances.map((balance, i) => parseUnits(balance, poolTokenDecimals(onchain, i)));
}

function poolTotalSupply(onchain: OnchainPoolData): BigNumber {
  return parseUnits(onchain.totalSupply, onchain.decimals);
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
  // TODO consider native assets
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
  const contract = new Contract(polygonHelperAddress, BalancerHelpers__factory.abi, provider);
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

export function calculatePoolInvestedAmounts(
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
