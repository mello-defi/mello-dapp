import { StablePoolExitKind, WeightedPoolExitKind } from '@balancer-labs/sdk';

export enum PoolType {
  Weighted = 'Weighted',
  Stable = 'Stable'
}
export enum WithdrawMode {
  OneToken = StablePoolExitKind.EXACT_BPT_IN_FOR_ONE_TOKEN_OUT |
    WeightedPoolExitKind.EXACT_BPT_IN_FOR_ONE_TOKEN_OUT,
  AllTokens = StablePoolExitKind.EXACT_BPT_IN_FOR_TOKENS_OUT |
    WeightedPoolExitKind.EXACT_BPT_IN_FOR_TOKENS_OUT
}
