import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { HYDRATE } from 'next-redux-wrapper';
import { BASE_API_URL, TAGS } from '@/consts/api';
import { Gift } from './types';

export const giftsApi = createApi({
  reducerPath: 'gifts/api',
  tagTypes: [TAGS.GIFTS],
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_API_URL}/gifts`,
  }),
  endpoints: (builder) => ({
    getGifts: builder.query<Gift[], undefined>({
      query: () => ({ url: '/' }),
      providesTags: [TAGS.GIFTS],
    }),
  }),
  extractRehydrationInfo: (action, { reducerPath }) => {
    if (action.type === HYDRATE) {
      return action.payload[reducerPath];
    }
  },
});

export const { useGetGiftsQuery } = giftsApi;
export const { getGifts } = giftsApi.endpoints;
