import { ethers } from 'ethers';
import { EvmNetworkDefinition } from '_enums/networks';
import { GenericTokenSet } from '_enums/tokens';
import { AnyAction } from 'redux';

export const CONNECT = 'CONNECT';
export const DISCONNECT = 'DISCONNECT';
export const SET_NETWORK = 'GET_WEB3_ADDRESS';

export interface Web3State {
  provider?: ethers.providers.Web3Provider;
  signer?: ethers.Signer;
  isConnected: boolean;
  network: EvmNetworkDefinition;
  tokenSet: GenericTokenSet;
}

interface GetNetworkAction extends AnyAction {
  type: typeof SET_NETWORK;
  payload: {
    network: EvmNetworkDefinition;
  };
}

interface ConnectWeb3ActionType extends AnyAction {
  type: typeof CONNECT;
  payload: {
    provider: ethers.providers.Web3Provider;
    signer: ethers.Signer;
  };
}

interface DisconnectWeb3ActionType extends AnyAction {
  type: typeof DISCONNECT;
  payload: {
    provider: null;
    signer: null;
  };
}
export type Web3ActionTypes =
  | GetNetworkAction
  | ConnectWeb3ActionType
  | DisconnectWeb3ActionType;
