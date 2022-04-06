import { defaultAbiCoder } from '@ethersproject/abi';
import { BigNumberish } from '@ethersproject/bignumber';
export enum WeightedPoolJoinKind {
  INIT = 0,
  EXACT_TOKENS_IN_FOR_BPT_OUT,
  TOKEN_IN_FOR_EXACT_BPT_OUT,
  ALL_TOKENS_IN_FOR_EXACT_BPT_OUT
}
export enum StablePoolJoinKind {
  INIT = 0,
  EXACT_TOKENS_IN_FOR_BPT_OUT,
  TOKEN_IN_FOR_EXACT_BPT_OUT
}

export enum StablePhantomPoolJoinKind {
  INIT = 0,
  COLLECT_PROTOCOL_FEES
}

export enum StablePoolExitKind {
  EXACT_BPT_IN_FOR_ONE_TOKEN_OUT = 0,
  EXACT_BPT_IN_FOR_TOKENS_OUT,
  BPT_IN_FOR_EXACT_TOKENS_OUT
}
export enum WeightedPoolExitKind {
  EXACT_BPT_IN_FOR_ONE_TOKEN_OUT = 0,
  EXACT_BPT_IN_FOR_TOKENS_OUT,
  BPT_IN_FOR_EXACT_TOKENS_OUT,
  MANAGEMENT_FEE_TOKENS_OUT
}

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

export class WeightedPoolEncoder {
  /**
   * Cannot be constructed.
   */
  private constructor() {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  }

  /**
   * Encodes the userData parameter for providing the initial liquidity to a WeightedPool
   * @param initialBalances - the amounts of tokens to send to the pool to form the initial balances
   */
  static joinInit = (amountsIn: BigNumberish[]): string =>
    defaultAbiCoder.encode(['uint256', 'uint256[]'], [WeightedPoolJoinKind.INIT, amountsIn]);

  /**
   * Encodes the userData parameter for joining a WeightedPool with exact token inputs
   * @param amountsIn - the amounts each of token to deposit in the pool as liquidity
   * @param minimumBPT - the minimum acceptable BPT to receive in return for deposited tokens
   */
  static joinExactTokensInForBPTOut = (
    amountsIn: BigNumberish[],
    minimumBPT: BigNumberish
  ): string =>
    defaultAbiCoder.encode(
      ['uint256', 'uint256[]', 'uint256'],
      [WeightedPoolJoinKind.EXACT_TOKENS_IN_FOR_BPT_OUT, amountsIn, minimumBPT]
    );

  /**
   * Encodes the userData parameter for joining a WeightedPool with a single token to receive an exact amount of BPT
   * @param bptAmountOut - the amount of BPT to be minted
   * @param enterTokenIndex - the index of the token to be provided as liquidity
   */
  static joinTokenInForExactBPTOut = (
    bptAmountOut: BigNumberish,
    enterTokenIndex: number
  ): string =>
    defaultAbiCoder.encode(
      ['uint256', 'uint256', 'uint256'],
      [WeightedPoolJoinKind.TOKEN_IN_FOR_EXACT_BPT_OUT, bptAmountOut, enterTokenIndex]
    );

  /**
   * Encodes the userData parameter for joining a WeightedPool proportionally to receive an exact amount of BPT
   * @param bptAmountOut - the amount of BPT to be minted
   */
  static joinAllTokensInForExactBPTOut = (bptAmountOut: BigNumberish): string =>
    defaultAbiCoder.encode(
      ['uint256', 'uint256'],
      [WeightedPoolJoinKind.ALL_TOKENS_IN_FOR_EXACT_BPT_OUT, bptAmountOut]
    );

  /**
   * Encodes the userData parameter for exiting a WeightedPool by removing a single token in return for an exact amount of BPT
   * @param bptAmountIn - the amount of BPT to be burned
   * @param enterTokenIndex - the index of the token to removed from the pool
   */
  static exitExactBPTInForOneTokenOut = (
    bptAmountIn: BigNumberish,
    exitTokenIndex: number
  ): string =>
    defaultAbiCoder.encode(
      ['uint256', 'uint256', 'uint256'],
      [WeightedPoolExitKind.EXACT_BPT_IN_FOR_ONE_TOKEN_OUT, bptAmountIn, exitTokenIndex]
    );

  /**
   * Encodes the userData parameter for exiting a WeightedPool by removing tokens in return for an exact amount of BPT
   * @param bptAmountIn - the amount of BPT to be burned
   */
  static exitExactBPTInForTokensOut = (bptAmountIn: BigNumberish): string =>
    defaultAbiCoder.encode(
      ['uint256', 'uint256'],
      [WeightedPoolExitKind.EXACT_BPT_IN_FOR_TOKENS_OUT, bptAmountIn]
    );

  /**
   * Encodes the userData parameter for exiting a WeightedPool by removing exact amounts of tokens
   * @param amountsOut - the amounts of each token to be withdrawn from the pool
   * @param maxBPTAmountIn - the minimum acceptable BPT to burn in return for withdrawn tokens
   */
  static exitBPTInForExactTokensOut = (
    amountsOut: BigNumberish[],
    maxBPTAmountIn: BigNumberish
  ): string =>
    defaultAbiCoder.encode(
      ['uint256', 'uint256[]', 'uint256'],
      [WeightedPoolExitKind.BPT_IN_FOR_EXACT_TOKENS_OUT, amountsOut, maxBPTAmountIn]
    );
}

export class ManagedPoolEncoder {
  /**
   * Cannot be constructed.
   */
  private constructor() {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  }

  /**
   * Encodes the userData parameter for exiting a ManagedPool for withdrawing management fees.
   * This can only be done by the pool owner.
   */
  static exitForManagementFees = (): string =>
    defaultAbiCoder.encode(['uint256'], [WeightedPoolExitKind.MANAGEMENT_FEE_TOKENS_OUT]);
}
export class StablePoolEncoder {
  /**
   * Cannot be constructed.
   */
  private constructor() {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  }

  /**
   * Encodes the userData parameter for providing the initial liquidity to a StablePool
   * @param initialBalances - the amounts of tokens to send to the pool to form the initial balances
   */
  static joinInit = (amountsIn: BigNumberish[]): string =>
    defaultAbiCoder.encode(['uint256', 'uint256[]'], [StablePoolJoinKind.INIT, amountsIn]);

  /**
   * Encodes the userData parameter for collecting protocol fees for StablePhantomPool
   */
  static joinCollectProtocolFees = (): string =>
    defaultAbiCoder.encode(['uint256'], [StablePhantomPoolJoinKind.COLLECT_PROTOCOL_FEES]);

  /**
   * Encodes the userData parameter for joining a StablePool with exact token inputs
   * @param amountsIn - the amounts each of token to deposit in the pool as liquidity
   * @param minimumBPT - the minimum acceptable BPT to receive in return for deposited tokens
   */
  static joinExactTokensInForBPTOut = (
    amountsIn: BigNumberish[],
    minimumBPT: BigNumberish
  ): string =>
    defaultAbiCoder.encode(
      ['uint256', 'uint256[]', 'uint256'],
      [StablePoolJoinKind.EXACT_TOKENS_IN_FOR_BPT_OUT, amountsIn, minimumBPT]
    );

  /**
   * Encodes the userData parameter for joining a StablePool with to receive an exact amount of BPT
   * @param bptAmountOut - the amount of BPT to be minted
   * @param enterTokenIndex - the index of the token to be provided as liquidity
   */
  static joinTokenInForExactBPTOut = (
    bptAmountOut: BigNumberish,
    enterTokenIndex: number
  ): string =>
    defaultAbiCoder.encode(
      ['uint256', 'uint256', 'uint256'],
      [StablePoolJoinKind.TOKEN_IN_FOR_EXACT_BPT_OUT, bptAmountOut, enterTokenIndex]
    );

  /**
   * Encodes the userData parameter for exiting a StablePool by removing a single token in return for an exact amount of BPT
   * @param bptAmountIn - the amount of BPT to be burned
   * @param enterTokenIndex - the index of the token to removed from the pool
   */
  static exitExactBPTInForOneTokenOut = (
    bptAmountIn: BigNumberish,
    exitTokenIndex: number
  ): string =>
    defaultAbiCoder.encode(
      ['uint256', 'uint256', 'uint256'],
      [StablePoolExitKind.EXACT_BPT_IN_FOR_ONE_TOKEN_OUT, bptAmountIn, exitTokenIndex]
    );

  /**
   * Encodes the userData parameter for exiting a StablePool by removing tokens in return for an exact amount of BPT
   * @param bptAmountIn - the amount of BPT to be burned
   */
  static exitExactBPTInForTokensOut = (bptAmountIn: BigNumberish): string =>
    defaultAbiCoder.encode(
      ['uint256', 'uint256'],
      [StablePoolExitKind.EXACT_BPT_IN_FOR_TOKENS_OUT, bptAmountIn]
    );

  /**
   * Encodes the userData parameter for exiting a StablePool by removing exact amounts of tokens
   * @param amountsOut - the amounts of each token to be withdrawn from the pool
   * @param maxBPTAmountIn - the minimum acceptable BPT to burn in return for withdrawn tokens
   */
  static exitBPTInForExactTokensOut = (
    amountsOut: BigNumberish[],
    maxBPTAmountIn: BigNumberish
  ): string =>
    defaultAbiCoder.encode(
      ['uint256', 'uint256[]', 'uint256'],
      [StablePoolExitKind.BPT_IN_FOR_EXACT_TOKENS_OUT, amountsOut, maxBPTAmountIn]
    );
}
