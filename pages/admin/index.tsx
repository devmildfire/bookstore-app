import * as React from 'react';

import { Products } from '@/components/Dashboard';

import { DashboardLayout } from '@/layouts';

import type { NextPageWithLayout } from '../_app';

const Admin: NextPageWithLayout = () => {
  return <Products />;
};

Admin.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default Admin;
