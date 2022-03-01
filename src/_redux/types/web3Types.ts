import { ethers } from 'ethers';
import { EvmNetworkDefinition } from '_enums/networks';
import { GenericTokenSet } from '_enums/tokens';

export const CONNECT = 'CONNECT';
export const DISCONNECT = 'DISCONNECT';
// export const SET_PROVIDER = 'SET_PROVIDER';
export const SET_NETWORK = 'GET_WEB3_ADDRESS';
export const GET_WEB3_BALANCE = 'GET_WEB3_BALANCE';

export interface Web3State {
  provider?: ethers.providers.Web3Provider;
  signer?: ethers.Signer;
  isConnected: boolean;
  balance: number;
  network: EvmNetworkDefinition;
  tokenSet: GenericTokenSet;
}

// interface SetProviderAction {
//   type: typeof SET_PROVIDER;
//   payload: {
//     provider: ethers.providers.Web3Provider;
//     address: string;
//   };
// }

interface GetNetworkAction {
  type: typeof SET_NETWORK;
  payload: {
    network: EvmNetworkDefinition;
  };
}

interface GetWeb3BalanceActionType {
  type: typeof GET_WEB3_BALANCE;
  payload: {
    balance: number;
  };
}

interface ConnectWeb3ActionType {
  type: typeof CONNECT;
  payload: {
    provider: ethers.providers.Web3Provider;
    signer: ethers.Signer;
  };
}

interface DisconnectWeb3ActionType {
  type: typeof DISCONNECT;
  payload: {
    provider: null;
    signer: null;
  };
}
export type Web3ActionTypes =
  | GetNetworkAction
  | GetWeb3BalanceActionType
  | ConnectWeb3ActionType
  | DisconnectWeb3ActionType;
