import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { HYDRATE } from 'next-redux-wrapper';
import { ID } from '@/types/common';
import { BoxSet } from './types';
import { BASE_API_URL, TAGS } from '@/consts/api';
import { Pagination } from '@/types/api';

export const boxSetsApi = createApi({
  reducerPath: 'box-sets/api',
  tagTypes: [TAGS.SETS, TAGS.SET],
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_API_URL}/box-sets`,
  }),
  endpoints: (builder) => ({
    getBoxSets: builder.query<BoxSet[], Pagination>({
      query: ({ count, page }) => ({
        url: '/',
        params: {
          count,
          page,
        },
      }),
      providesTags: [TAGS.SETS],
    }),
    getBoxSet: builder.query<BoxSet, ID>({
      query: (id) => ({ url: `/${id}` }),
      providesTags: [TAGS.SET],
    }),
  }),
  extractRehydrationInfo: (action, { reducerPath }) => {
    if (action.type === HYDRATE) {
      return action.payload[reducerPath];
    }
  },
});

export const { useGetBoxSetsQuery, useGetBoxSetQuery } = boxSetsApi;
export const { getBoxSets, getBoxSet } = boxSetsApi.endpoints;
