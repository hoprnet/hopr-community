import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/dist/query';
import { gameSlice } from './gameSlice/gameSlice';
import { peerApi } from './peerSlice/peerApi';
import { peerSlice } from './peerSlice/peerSlice';

import { createBrowserHistory } from 'history'
import { createReduxHistoryContext } from "redux-first-history";

const { createReduxHistory, routerMiddleware, routerReducer } = createReduxHistoryContext({ 
  history: createBrowserHistory(),
});


const rootReducer = combineReducers({
    [peerApi.reducerPath]: peerApi.reducer,
    [peerSlice.name]: peerSlice.reducer,
    [gameSlice.name]: gameSlice.reducer,
    router: routerReducer,
})

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(peerApi.middleware, routerMiddleware)
})

export const history = createReduxHistory(store);

setupListeners(store.dispatch)
