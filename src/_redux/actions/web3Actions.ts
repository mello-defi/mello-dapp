import { ethers } from 'ethers';
import {
  GET_WEB3_BALANCE,
  SET_NETWORK,
  SET_PROVIDER,
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

export const setProviderAction = (
  provider: ethers.providers.Web3Provider,
  address: string
): Web3ActionTypes => {
  return {
    type: SET_PROVIDER,
    payload: {
      provider,
      address
    }
  };
};
