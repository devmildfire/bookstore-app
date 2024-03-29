/* eslint-disable operator-linebreak */
import React from 'react';
import type { NextPage } from 'next';
import HomeLayout from '@/layouts/HomeLayout';
import { getBoxSets } from '@/models/boxSets';
import { wrapper } from '@/models';
import Sets from '@/components/SetsPage/Sets';
import { getPopularBooks } from '@/models/books';
import PageLayout from '@/layouts/PageLayout';

const SetsPage: NextPage = () => (
  <PageLayout headTitle='Бокс-сеты'>
    <HomeLayout title='БОКС-СЕТЫ'>
      <Sets />
    </HomeLayout>
  </PageLayout>
);

export default SetsPage;
