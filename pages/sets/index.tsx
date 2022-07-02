import React from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import HomePage from '@/components/HomePage';

const Sets: NextPage = () => <HomePage> </HomePage>;

export const getServerSideProps: GetServerSideProps = async () => ({
  props: {},
});

export default Sets;
