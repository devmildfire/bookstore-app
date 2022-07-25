import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { HYDRATE } from 'next-redux-wrapper';
import { Book } from '../books';
import { BASE_API_URL } from '@/consts/api';

export const popularProductsApi = createApi({
  reducerPath: 'popular/api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_API_URL}/popular`,
  }),
  endpoints: (builder) => ({
    getPopularProducts: builder.query<Book[], undefined>({
      query: () => ({ url: '/' }),
    }),
  }),
  extractRehydrationInfo: (action, { reducerPath }) => {
    if (action.type === HYDRATE) {
      return action.payload[reducerPath];
    }
  },
});

export const { useGetPopularProductsQuery } = popularProductsApi;
export const { getPopularProducts } = popularProductsApi.endpoints;
