import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { HYDRATE } from 'next-redux-wrapper';
import { ID } from '@/types/common';
import { BoxSet } from './types';

export const boxSetsApi = createApi({
  reducerPath: 'box-sets/api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3000/api/box-sets',
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

    return undefined;
  },
});

export const { useGetBoxSetsQuery } = boxSetsApi;
export const { getBoxSets } = boxSetsApi.endpoints;
