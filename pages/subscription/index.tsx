/* eslint-disable operator-linebreak */
import React from 'react';
import type { NextPage } from 'next';
import HomePage from '@/components/HomePage';
import { wrapper } from '@/models';
import { getPopularBooks } from '@/models/books';
import { getSubscriptions } from '@/models/subscriptions';
import Subscriptions from '@/components/SubscriptionsPage/Subscriptions';

const SubscriptionPage: NextPage = () => (
  <HomePage title='Чудеса подписки'>
    <Subscriptions />
  </HomePage>
);

export const getStaticProps = wrapper.getStaticProps(
  ({ dispatch }) =>
    async () => {
      const requests:Promise<unknown>[] = [
        dispatch(getPopularBooks.initiate(undefined)),
        dispatch(getSubscriptions.initiate(undefined)),
      ];

      await Promise.all(requests);
      return {
        props: {},
        revalidate: 5000,
      };
    },
);

export default SubscriptionPage;
