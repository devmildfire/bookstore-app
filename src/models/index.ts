/* eslint-disable import/no-cycle */
import {
  addListener,
  AnyAction,
  combineReducers,
  configureStore,
} from '@reduxjs/toolkit';
import { createWrapper, HYDRATE } from 'next-redux-wrapper';
import { Reducer } from 'react';
import { booksApi } from './books';
import { boxSetsApi } from './boxSets';

const reducers = combineReducers({
  [booksApi.reducerPath]: booksApi.reducer,
  [boxSetsApi.reducerPath]: boxSetsApi.reducer,
});

const reducer: Reducer<Store, AnyAction> = (state, action) => {
  if (action.type === HYDRATE) {
    return {
      ...state,
      ...action.payload,
    };
  }
  return reducers(state, action);
};

const makeStore = () => {
  const store = configureStore({
    /* @ts-ignore */
    reducer,
    devTools: true,
    /* @ts-ignore */
    middleware: (getDefaultMiddleware) => {
      const middleware = getDefaultMiddleware();
      middleware.concat(boxSetsApi.middleware).concat(booksApi.middleware);
      return middleware;
    },
  });
  /* @ts-ignore */
  addListener(store.dispatch);

  return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type Store = ReturnType<typeof reducers>;
export type AppDispatch = AppStore['dispatch'];

export const wrapper = createWrapper(makeStore, {
  debug: true,
});
