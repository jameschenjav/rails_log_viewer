import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import _ from 'lodash';

import './index.css';
import App from './App';
import { store } from './lib/store';
import { initWebsocket } from './lib/ws';

const root = createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);

initWebsocket();

Object.assign(window, { _ });
