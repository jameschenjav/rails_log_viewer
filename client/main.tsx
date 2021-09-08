import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import _ from 'lodash';

import './index.css';
import App from './App';
import { store } from './lib/store';
import { initWebsocket } from './lib/ws';

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root'),
);

initWebsocket();

Object.assign(window, { _ });
