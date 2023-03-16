/* eslint-disable import/no-cycle */
import {
  // addListener,
  // AnyAction,
  combineReducers,
  configureStore,
} from '@reduxjs/toolkit';
import {
  createWrapper,
  // , HYDRATE
} from 'next-redux-wrapper';
// import { Reducer } from 'react';
import { booksApi } from './books';
import { boxSetsApi } from './boxSets';
import { giftsApi } from './gifts';
import { subscriptionApi } from './subscriptions';

// const apis = [boxSetsApi, booksApi, giftsApi, subscriptionApi];

const reducers = combineReducers({
  [booksApi.reducerPath]: booksApi.reducer,
  [boxSetsApi.reducerPath]: boxSetsApi.reducer,
  [giftsApi.reducerPath]: giftsApi.reducer,
  [subscriptionApi.reducerPath]: subscriptionApi.reducer,
});

// const reducer: Reducer<Store, AnyAction> = (state, action) => {
//   if (action.type === HYDRATE) {
//     return {
//       ...state,
//       ...action.payload,
//     };
//   }
//   return reducers(state, action);
// };

const makeStore = () => {
  const store = configureStore({
    reducer: () => 'hi',
  });
  // addListener(store.dispatch);
  return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type Store = ReturnType<typeof reducers>;
export type AppDispatch = AppStore['dispatch'];

export const wrapper = createWrapper(makeStore, {
  debug: false,
});
