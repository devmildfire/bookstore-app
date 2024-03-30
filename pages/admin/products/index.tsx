import * as React from 'react';
import { AddProduct } from '@/components/Dashboard';
import { DashboardLayout } from '@/layouts';
import type { NextPageWithLayout } from '../../_app';

const Products: NextPageWithLayout = () => {
  return <AddProduct />;
};

Products.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default Products;
