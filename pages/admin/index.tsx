import * as React from 'react';

import { Products } from '@/components/Dashboard';

import { withDashboardLayout } from '@/layouts';
import { NextPageWithLayout } from '@/types/page';

const Admin: NextPageWithLayout = () => {
  return <Products />;
};

export default withDashboardLayout(Admin);
