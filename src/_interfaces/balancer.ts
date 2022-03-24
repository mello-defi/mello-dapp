export interface LiquidityMiningTokenRewards {
  tokenAddress: string;
  amount: number;
}

export interface LiquidityMiningPool {
  [key: string]: LiquidityMiningTokenRewards[];
}

export interface LiquidityMiningPoolResult {
  chainId: number;
  pools: LiquidityMiningPool;
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
  poolApr: string;
  liquidityMiningApr: string | number;
  swapApr: string | number;
  thirdPartyApr: string;
  hasLiquidityMiningRewards: boolean;
  createTime: number;
  mainTokens?: string[];
  wrappedTokens?: string[];
  linearPoolTokensMap?: Record<string, PoolToken>;
  unwrappedTokens?: string[];
}
