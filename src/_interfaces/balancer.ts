import { BigNumber } from 'ethers';
import { PoolType } from '_enums/balancer';
import { EvmTokenDefinition, TokenDefinition } from '_enums/tokens';

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

export interface PoolToken {
  address: string;
  balance: string;
  weight: string;
  decimals: number;
  name: string;
  priceRate: string | null;
  symbol: string;
}
export interface TokenInfo {
  readonly chainId: number;
  readonly address: string;
  readonly name: string;
  readonly decimals: number;
  readonly symbol: string;
  readonly logoURI?: string;
  readonly tags?: string[];
  readonly extensions?: {
    readonly [key: string]: string | number | boolean | null;
  };
}

export type TokenInfoMap = { [address: string]: TokenInfo };

export interface Pool {
  id: string;
  address: string;
  poolType: PoolType;
  swapFee: string;
  owner: string;
  factory: string;
  tokens: PoolToken[];
  tokensList: string[];
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

export type LinearPoolDataMap = Record<string, LinearPoolData>;

export type OnchainTokenDataMap = Record<string, OnchainTokenData>;

export type RawLinearPoolDataMap = Record<string, RawLinearPoolData>;

export interface OnchainPoolData {
  tokens: Record<string, OnchainTokenData>;
  totalSupply: string;
  decimals: number;
  swapFee: string;
  swapEnabled: boolean;
  amp?: string;
  // swapEnabled: boolean;
  linearPools?: Record<string, LinearPoolData>;
  tokenRates?: string[];
}

export interface Amounts {
  send: string[];
  receive: string[];
  fixedToken: number;
}
export interface QueryExitResponse {
  amountsOut: BigNumber[];
  bptIn: BigNumber;
}

export interface TokenClaimInfo {
  label: string;
  distributor: string;
  token: string;
  decimals: number;
  manifest: string;
  weekStart: number;
}

export interface TokenDecimals {
  [key: string]: number;
}
export type Snapshot = Record<number, string>;

export type ClaimStatus = boolean;
export type Report = Record<string, any>;
export interface Claim {
  id: string;
  amount: string;
}

export interface MultiTokenPendingClaims {
  claims: Claim[];
  reports: Report;
  tokenClaimInfo: TokenClaimInfo;
  availableToClaim: string;
}
export type MultiTokenCurrentRewardsEstimate = {
  rewards: string;
  velocity: string;
  token: string;
};
export type MultiTokenCurrentRewardsEstimateResponse = {
  success: boolean;
  result: {
    current_timestamp: string;
    'liquidity-providers': Array<{
      snapshot_timestamp: string;
      address: string;
      token_address: string;
      chain_id: number;
      current_estimate: string;
      velocity: string;
      week: number;
    }>;
  };
};
export interface ClaimableToken extends TokenDefinition {
  fiatValue: number;
  value: string;
}
export type ComputeClaimProofPayload = {
  report: Report;
  account: string;
  claim: Claim;
  distributor: string;
  tokenIndex: number;
  decimals: number;
};
export type ClaimProofTuple = [number, string, string, number, string[]]; // claimId, claimAmount, distributor, tokenIndex, proof
export type ClaimWorkerMessage<P = any> = {
  type: 'computeClaimProof';
  payload: P;
};
