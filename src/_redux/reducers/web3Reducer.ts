import { GET_WEB3_BALANCE, SET_NETWORK, SET_PROVIDER, Web3ActionTypes, Web3State } from '_redux/types/web3Types';
import { evmNetworks } from '_enums/networks';
import { polygonMainnetTokens } from '_enums/tokens';

const network = evmNetworks.polygonMainnet;
// const initialChainId = localStorage.getItem('preferredChainId');
// if (initialChainId) {
//   network = evmNetworks.findById(initialChainId);
// }
const initialState: Web3State = {
  provider: undefined,
  isConnected: false,
  balance: 0,
  userAddress: '',
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
    case GET_WEB3_BALANCE:
      return {
        ...state,
        balance: action.payload.balance
      };
    case SET_PROVIDER:
      return {
        ...state,
        provider: action.payload.provider,
        isConnected: true,
        userAddress: action.payload.address
      };
    default:
      return state;
  }
};
