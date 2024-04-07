import * as React from 'react';

import { EditAuthor } from '@/components/Dashboard';
import { withDashboardLayout } from '@/layouts';
import { NextPageWithLayout } from '@/types/page';
import { GetServerSideProps } from 'next/types';
import { usePathname } from 'next/navigation';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;

  return {
    props: { id },
  };
};

const AddAuthorPage: NextPageWithLayout<{ id: string }> = ({ id }) => {
  const pathname = usePathname();
  console.log(pathname);
  return <EditAuthor id={id} />;
};

export default withDashboardLayout(AddAuthorPage);
