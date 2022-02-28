import { applyMiddleware, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import rootReducer from '_redux/reducers';

const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(thunkMiddleware)));

export type AppState = ReturnType<typeof rootReducer>;
export default store;
