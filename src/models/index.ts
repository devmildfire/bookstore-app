/* eslint-disable import/no-cycle */
import { AnyAction, combineReducers, configureStore } from '@reduxjs/toolkit';
import { createWrapper, HYDRATE } from 'next-redux-wrapper';
import { Reducer } from 'react';
import books, { BooksState } from './books';

export interface Store {
  readonly books: BooksState;
}

const reducers = combineReducers<Store>({
  books,
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

const makeStore = () => configureStore({
  // @ts-ignore
  reducer,
  devTools: true,
});

export type AppDispatch = ReturnType<typeof makeStore>['dispatch']

export const wrapper = createWrapper(makeStore, {
  debug: true,
});
