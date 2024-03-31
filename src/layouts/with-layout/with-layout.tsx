import { NextPageWithLayout } from '@/types/page';
import * as React from 'react';

export const withLayout =
  (Layout: React.FC<{ children: React.ReactNode }>) =>
  (Page: NextPageWithLayout) => {
    Page.getLayout = (page) => <Layout>{page}</Layout>;

    return Page;
  };
