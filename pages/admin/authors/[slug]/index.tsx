import * as React from 'react';

import { EditAuthor } from '@/components/Dashboard';
import { withDashboardLayout } from '@/layouts';
import { NextPageWithLayout } from '@/types/page';

const AddAuthorPage: NextPageWithLayout = () => {
  return <EditAuthor />;
};

export default withDashboardLayout(AddAuthorPage);
