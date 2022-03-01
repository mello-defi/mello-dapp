import { ethers } from 'ethers';
import {
  CONNECT,
  DISCONNECT,
  GET_WEB3_BALANCE,
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

export const getWalletBalanceAction = (balance: number): Web3ActionTypes => {
  return {
    type: GET_WEB3_BALANCE,
    payload: {
      balance
    }
  };
};

// export const setProviderAction = (
//   provider: ethers.providers.Web3Provider,
//   address: string
// ): Web3ActionTypes => {
//   return {
//     type: SET_PROVIDER,
//     payload: {
//       provider,
//       address
//     }
//   };
// };
export const connectAction = (
  provider: ethers.providers.Web3Provider,
  signer: ethers.Signer,
): Web3ActionTypes => {
  return {
    type: CONNECT,
    payload: {
      provider,
      signer,
    }
  };
};
export const disconnectAction = (
): Web3ActionTypes => {
  return {
    type: DISCONNECT,
    payload: {
      provider: null,
      signer: null,
    }
  };
};
