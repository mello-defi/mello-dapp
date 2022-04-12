export enum TransactionServices {
  Aave = 'aave',
  Balancer = 'balancer',
  Paraswap = 'paraswap',
  Wallet = 'wallet',
  Biconomy = 'biconomy',
  Ren = 'ren',
}

export enum GenericActions {
  Approve = 'approve',
}
export enum AaveActions {
  Deposit = 'deposit',
  Borrow = 'borrow',
  Withdraw = 'withdraw',
  Repay = 'repay',
}

export enum BalancerActions {
  Invest = 'invest',
  Withdraw = 'withdraw',
}

export enum ParaswapActions {
  Swap = 'swap',
}

export enum WalletActions {
  Send = 'send',
}

export enum BiconomyActions {
  Mint = 'mint',
  Deposit = 'deposit',
}

export enum RenActions {
  Mint = 'mint',
}
