import { CONNECT, DISCONNECT, SET_NETWORK, Web3ActionTypes, Web3State } from '_redux/types/web3Types';
import { evmNetworks } from '_enums/networks';
import { polygonMainnetTokens } from '_enums/tokens';

const network = evmNetworks.polygonMainnet;
// const initialChainId = localStorage.getItem('preferredChainId');
// if (initialChainId) {
//   network = evmNetworks.findById(initialChainId);
// }
const initialState: Web3State = {
  // TODOmove to hook
  provider: undefined,
  signer: undefined,
  isConnected: false,
  network,
  tokenSet: polygonMainnetTokens
};

export const getWeb3Reducer = (
  state: Web3State = initialState,
  action: Web3ActionTypes
): Web3State => {
  switch (action.type) {
    case SET_NETWORK:
      return {
        ...state,
        network: action.payload.network
      };
    case CONNECT:
      return {
        ...state,
        provider: action.payload.provider,
        signer: action.payload.signer,
        isConnected: true
      };
    case DISCONNECT:
      return {
        ...state,
        provider: undefined,
        isConnected: false
      };
    default:
      return state;
  }
};
