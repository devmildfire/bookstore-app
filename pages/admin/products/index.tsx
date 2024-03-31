import * as React from 'react';
import { AddProduct } from '@/components/Dashboard';
import { withDashboardLayout } from '@/layouts';
import { NextPageWithLayout } from '@/types/page';

const Products: NextPageWithLayout = () => {
  return <AddProduct />;
};

export default withDashboardLayout(Products);
