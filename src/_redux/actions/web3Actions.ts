import { ethers } from 'ethers';
import {
  CONNECT,
  DISCONNECT,
  SET_NETWORK,
  Web3ActionTypes
} from '_redux/types/web3Types';
import { EvmNetworkDefinition } from '_enums/networks';

export const setNetworkAction = (network: EvmNetworkDefinition): Web3ActionTypes => {
  return {
    type: SET_NETWORK,
    payload: {
      network
    }
  };
};

export const connectAction = (
  provider: ethers.providers.Web3Provider,
  signer: ethers.Signer
): Web3ActionTypes => {
  return {
    type: CONNECT,
    payload: {
      provider,
      signer
    }
  };
};
export const disconnectAction = (): Web3ActionTypes => {
  return {
    type: DISCONNECT,
    payload: {
      provider: null,
      signer: null
    }
  };
};
