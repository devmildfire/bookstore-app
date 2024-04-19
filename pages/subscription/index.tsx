/* eslint-disable operator-linebreak */
import React from 'react';
import type { NextPage } from 'next';
import HomePage from '@/layouts/HomeLayout';
import { wrapper } from '@/models';
import { getPopularBooks } from '@/models/books';
import { getSubscriptions } from '@/models/subscriptions';
import Subscriptions from '@/components/SubscriptionsPage/Subscriptions';
import PageLayout from '@/layouts/PageLayout';

const SubscriptionPage: NextPage = () => (
  <PageLayout headTitle='Карты даров'>
    <HomePage title='Карты даров'>
      <Subscriptions />
    </HomePage>
  </PageLayout>
);

export default SubscriptionPage;
