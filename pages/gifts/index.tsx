/* eslint-disable operator-linebreak */
import React from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import HomePage from '@/components/HomePage';
import { wrapper } from '@/models';
import { getPopularProducts } from '@/models/popularProducts';

const Gifts: NextPage = () => <HomePage title='Карты даров'> </HomePage>;

export const getServerSideProps: GetServerSideProps =
  wrapper.getServerSideProps((store) => async () => {
    const requests = [store.dispatch(getPopularProducts.initiate(undefined))];

    await Promise.all(requests);
    return {
      props: {},
    };
  });

export default Gifts;
