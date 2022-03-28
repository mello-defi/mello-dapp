import { combineReducers } from 'redux';
import { getUIReducer } from '_redux/reducers/uiReducer';
import { getWeb3Reducer } from '_redux/reducers/web3Reducer';
import { getWalletReducer } from '_redux/reducers/walletReducer';
import { getMarketReducer } from '_redux/reducers/marketReducer';
import { getAaveReducer } from '_redux/reducers/aaveReducer';
import { getOnboardingReducer } from '_redux/reducers/onboardingReducer';
import { getBalancerReducer } from '_redux/reducers/balancerReducer';

const rootReducer = combineReducers({
  ui: getUIReducer,
  web3: getWeb3Reducer,
  wallet: getWalletReducer,
  markets: getMarketReducer,
  aave: getAaveReducer,
  onboarding: getOnboardingReducer,
  balancer: getBalancerReducer
});

export default rootReducer;
