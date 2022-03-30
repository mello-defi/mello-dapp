import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
// import { store, persistor } from '_redux/store';
import * as Sentry from '@sentry/react';
// import { } from '_redux/store';
import { BrowserTracing } from '@sentry/tracing';
import { persistor, store } from '_redux/store';
import { PersistGate } from 'redux-persist/integration/react';

Sentry.init({
  dsn: 'https://dc6ad1de607440fb96abd7913538948f@o1155179.ingest.sentry.io/6235471',
  integrations: [new BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0
});

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
