import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { HYDRATE } from 'next-redux-wrapper';
import { ID } from '@/types/common';
import { BoxSet } from './types';
import { BASE_API_URL } from '@/consts/api';

export const boxSetsApi = createApi({
  reducerPath: 'box-sets/api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_API_URL}/box-sets`,
  }),
  endpoints: (builder) => ({
    getBoxSets: builder.query<BoxSet[], undefined>({
      query: () => ({ url: '/' }),
    }),
    getBoxSet: builder.query<BoxSet, ID>({
      query: (id) => ({ url: `/${id}` }),
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
