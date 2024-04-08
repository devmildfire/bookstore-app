/* eslint-disable operator-linebreak */
import React from 'react';
import type { NextPage } from 'next';
import HomeLayout from '@/layouts/HomeLayout';
import Gifts from '@/components/GiftsPage/Gifts';
import PageLayout from '@/layouts/PageLayout';

const GiftsPage: NextPage = () => (
  <PageLayout headTitle='Карты даров'>
    <HomeLayout title='Карты даров'>
      <Gifts />
    </HomeLayout>
  </PageLayout>
);

export default GiftsPage;
