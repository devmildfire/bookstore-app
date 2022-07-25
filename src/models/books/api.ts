import { HYDRATE } from 'next-redux-wrapper';
/* eslint-disable import/no-cycle */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { Book } from './types';
import { ID } from '@/types/common';
import { BASE_API_URL } from '@/consts/api';

export const booksApi = createApi({
  reducerPath: 'books/api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_API_URL}/books`,
  }),
  endpoints: (builder) => ({
    getBooks: builder.query<Book[], undefined>({
      query: () => ({ url: '/' }),
    }),
    getBook: builder.query<Book, ID>({
      query: (id) => ({ url: `/${id}` }),
    }),
  }),
  extractRehydrationInfo: (action, { reducerPath }) => {
    if (action.type === HYDRATE) {
      return action.payload[reducerPath];
    }

    return undefined;
  },
});

export const { useGetBooksQuery, useGetBookQuery } = booksApi;
export const { getBooks, getBook } = booksApi.endpoints;
