import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { BrowserRouter } from 'react-router-dom';
import reducers from './reducers';

// create redux store
const store = createStore(reducers, {}, compose(
  applyMiddleware(thunk),
  window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : f => f,
));

// set favicon depending on system dark mode
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  const faviconDark = document.getElementById('faviconDark');
  if (faviconDark) document.head.removeChild(faviconDark);
} else {
  const faviconLight = document.getElementById('faviconLight');
  if (faviconLight) document.head.removeChild(faviconLight);
}

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
);

serviceWorker.register();
