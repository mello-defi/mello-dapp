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
