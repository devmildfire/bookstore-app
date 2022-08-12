import { HYDRATE } from 'next-redux-wrapper';
/* eslint-disable import/no-cycle */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { Book, BookType } from './types';
import { ID } from '@/types/common';
import { BASE_API_URL, TAGS } from '@/consts/api';
import { Pagination } from '@/types/api';
import { Author } from '@/types/author';

export interface GetBooksQuery extends Pagination {
  readonly publishYear?: string[] | null;
  readonly productType?: BookType[] | null;
}

export const booksApi = createApi({
  reducerPath: 'books/api',
  tagTypes: [TAGS.BOOK, TAGS.BOOKS],
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_API_URL}/books`,
  }),
  endpoints: (builder) => ({
    getBooks: builder.query<Book[], GetBooksQuery>({
      query: (params) => ({
        url: '/',
        params,
      }),
      providesTags: [TAGS.BOOKS],
    }),
    getBook: builder.query<Book, ID>({
      query: (id) => ({ url: `/${id}` }),
      providesTags: [TAGS.BOOK],
    }),
    getPopularBooks: builder.query<Book[], undefined>({
      query: () => ({ url: '/popular' }),
    }),
    getYearFilter: builder.query<string[], undefined>({
      query: () => '/filter/years',
    }),
    getTypeFilter: builder.query<BookType[], undefined>({
      query: () => '/filter/type',
    }),
    getSortFilter: builder.query<string[], undefined>({
      query: () => '/filter/sort',
    }),
    getAuthorFilter: builder.query<Author[], undefined>({
      query: () => '/filter/authors',
    }),
  }),
  extractRehydrationInfo: (action, { reducerPath }) => {
    if (action.type === HYDRATE) {
      return action.payload[reducerPath];
    }

    return undefined;
  },
});

export const {
  useGetBooksQuery,
  useGetBookQuery,
  useGetPopularBooksQuery,
  useGetAuthorFilterQuery,
  useGetSortFilterQuery,
  useGetTypeFilterQuery,
  useGetYearFilterQuery,
} = booksApi;
export const {
  getBooks,
  getBook,
  getPopularBooks,
  getAuthorFilter,
  getSortFilter,
  getTypeFilter,
  getYearFilter,
} = booksApi.endpoints;
