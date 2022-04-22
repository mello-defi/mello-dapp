import {
  AaveActions,
  BalancerActions,
  BiconomyActions,
  GenericActions,
  ParaswapActions,
  RenActions,
  WalletActions
} from '_enums/db';

export interface Transaction {
  hash: string;
  chain_id: number;
  service: string;
  action: string;
  amount?: string;
  symbol?: string;
}

export type TransactionAction =
  | GenericActions
  | AaveActions
  | BalancerActions
  | ParaswapActions
  | WalletActions
  | BiconomyActions
  | RenActions;
