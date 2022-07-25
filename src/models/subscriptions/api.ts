import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { HYDRATE } from 'next-redux-wrapper';
import { Subscription } from './types';
import { BASE_API_URL, TAGS } from '@/consts/api';

export const subscriptionApi = createApi({
  reducerPath: 'subscription/api',
  tagTypes: [TAGS.SUBSCRIPTIONS],
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_API_URL}/subscriptions`,
  }),
  endpoints: (builder) => ({
    getSubscriptions: builder.query<Subscription[], undefined>({
      query: () => ({ url: '/' }),
      providesTags: [TAGS.SUBSCRIPTIONS],
    }),
  }),
  extractRehydrationInfo: (action, { reducerPath }) => {
    if (action.type === HYDRATE) {
      return action.payload[reducerPath];
    }
  },
});

export const { useGetSubscriptionsQuery } = subscriptionApi;
export const { getSubscriptions } = subscriptionApi.endpoints;
