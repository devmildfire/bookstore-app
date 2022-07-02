import React from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import HomePage from '@/components/HomePage';

const Subscription: NextPage = () => <HomePage> </HomePage>;

export const getServerSideProps: GetServerSideProps = async () => ({
  props: {},
});

export default Subscription;
