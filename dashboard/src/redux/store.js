import { persistStore, persistReducer } from 'redux-persist';
import {
  seamlessImmutableReconciler,
  seamlessImmutableTransformCreator,
} from 'redux-persist-seamless-immutable';
import { encryptTransform } from 'redux-persist-transform-encrypt';
import { applyMiddleware, compose, createStore } from 'redux';
import { createBrowserHistory } from 'history';
import { routerMiddleware } from 'connected-react-router';
import storage from 'redux-persist/lib/storage';
import logger from 'redux-logger';
import thunk from 'redux-thunk';
import reducers from './reducers';

export const history = createBrowserHistory({
  initialEntries: [{ state: { key: 'home' } }],
});
const transformerConfig = {
  whitelistPerReducer: {
    auth: ['token', 'user', 'role'],
    app: ['tab', 'version'],
  },
};

const persistConfig = {
  key: 'hopr-pwa-v1.0',
  storage, // Defaults to localStorage
  stateReconciler: seamlessImmutableReconciler,
  transforms: [
    seamlessImmutableTransformCreator(transformerConfig),
    encryptTransform({
      secretKey: process.env.REACT_APP_SECURE_TOKEN,
      onError: function (error) {
        // Handle the error.
        console.log(error);
      },
    }),
  ],
  whitelist: ['auth', 'app'],
};

const persistedReducer = persistReducer(persistConfig, reducers(history));

export const store = createStore(
  persistedReducer,
  compose(applyMiddleware(routerMiddleware(history), logger, thunk))
);

export const persistor = persistStore(store);
