import * as React from 'react';
import { withDashboardLayout } from '@/layouts';
import { NextPageWithLayout } from '@/types/page';
import { Authors } from '@/components/Dashboard';

const AuthorsPage: NextPageWithLayout = () => {
  return <Authors />;
};

export default withDashboardLayout(AuthorsPage);
