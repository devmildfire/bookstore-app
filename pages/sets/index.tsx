/* eslint-disable operator-linebreak */
import React from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import HomePage from '@/components/HomePage';
import { getBoxSets } from '@/models/boxSets';
import { wrapper } from '@/models';
import Sets from '@/components/SetsPage/Sets';

const SetsPage: NextPage = () => (
  <HomePage>
    <Sets />
  </HomePage>
);

export const getServerSideProps: GetServerSideProps =
  wrapper.getServerSideProps((store) => async () => {
    await store.dispatch(getBoxSets.initiate(undefined));
    return {
      props: {},
    };
  });

export default SetsPage;
