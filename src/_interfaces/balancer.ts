import { BigNumber } from 'ethers';

export interface LiquidityMiningTokenReward {
  tokenAddress: string;
  amount: number;
}

export interface LiquidityMiningPool {
  [key: string]: LiquidityMiningTokenReward[];
}

export interface LiquidityMiningPoolResult {
  chainId: number;
  pools: LiquidityMiningPool;
}

export interface UserPool {
  id: string;
  poolId: Pool;
  balance: string;
}

export enum PoolType {
  Weighted = 'Weighted',
  Investment = 'Investment',
  Stable = 'Stable',
  MetaStable = 'MetaStable',
  StablePhantom = 'StablePhantom',
  LiquidityBootstrapping = 'LiquidityBootstrapping'
}

export interface PoolToken {
  address: string;
  balance: string;
  weight: string;
  decimals: number;
  name: string;
  priceRate: string | null;
  symbol?: string;
}

export interface Pool {
  id: string;
  address: string;
  poolType: PoolType;
  swapFee: string;
  owner: string;
  factory: string;
  tokens: PoolToken[];
  tokensList: string[];
  tokenAddresses: string[];
  totalLiquidity: string;
  miningTotalLiquidity: string;
  totalShares: string;
  totalSwapFee: string;
  totalSwapVolume: string;
  totalApr: string;
  liquidityMiningApr: number;
  swapApr: number;
  thirdPartyApr: string;
  hasLiquidityMiningRewards: boolean;
  createTime: number;
  mainTokens?: string[];
  wrappedTokens?: string[];
  linearPoolTokensMap?: Record<string, PoolToken>;
  unwrappedTokens?: string[];
}

export interface OnchainTokenData {
  balance: string;
  weight: number;
  decimals: number;
  logoURI: string | undefined;
  name: string;
  symbol: string;
}

export interface LinearPoolToken {
  address: string;
  index: number;
  balance: string;
}

export interface WrappedLinearPoolToken extends LinearPoolToken {
  priceRate: string;
}

export interface LinearPoolData {
  id: string;
  priceRate: string;
  mainToken: LinearPoolToken;
  wrappedToken: WrappedLinearPoolToken;
  unwrappedTokenAddress: string;
  totalSupply: string;
}

export interface RawPoolTokens {
  balances: BigNumber[];
  lastChangeBlock: BigNumber;
  tokens: string[];
}

export interface RawLinearPoolToken {
  address: string;
  index: BigNumber;
}

export interface RawWrappedLinearPoolToken extends RawLinearPoolToken {
  rate: string;
}

export interface RawLinearPoolData {
  id: string;
  priceRate: BigNumber;
  mainToken: RawLinearPoolToken;
  wrappedToken: RawWrappedLinearPoolToken;
  unwrappedTokenAddress: string;
  totalSupply: string;
  tokenData: RawPoolTokens;
}

export interface RawOnchainPoolData {
  decimals: number;
  poolTokens: RawPoolTokens;
  swapFee: BigNumber;
  totalSupply: BigNumber;
  weights?: BigNumber[];
  swapEnabled?: boolean;
  amp?: {
    value: BigNumber;
    precision: BigNumber;
  };
  linearPools?: Record<string, RawLinearPoolData>;
  tokenRates?: BigNumber[];
}

export type OnchainTokenDataMap = Record<string, OnchainTokenData>;

export interface OnchainPoolData {
  tokens: Record<string, OnchainTokenData>;
  totalSupply: string;
  decimals: number;
  swapFee: string;
  amp?: string;
  // swapEnabled: boolean;
  linearPools?: Record<string, LinearPoolData>;
  tokenRates?: string[];
}
