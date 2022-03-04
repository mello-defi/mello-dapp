import { combineReducers } from 'redux';
import { getUIReducer } from '_redux/reducers/uiReducer';
import { getWeb3Reducer } from '_redux/reducers/web3Reducer';
import { getWalletReducer } from '_redux/reducers/walletReducer';
import { getMarketReducer } from '_redux/reducers/marketReducer';
import { getAaveReducer } from '_redux/reducers/aaveReducer';

const rootReducer = combineReducers({
  ui: getUIReducer,
  web3: getWeb3Reducer,
  wallet: getWalletReducer,
  markets: getMarketReducer,
  aave: getAaveReducer
});

export default rootReducer;
