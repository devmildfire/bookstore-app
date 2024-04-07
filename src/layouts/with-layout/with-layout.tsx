import { NextPageWithLayout } from '@/types/page';
import * as React from 'react';

export const withLayout =
  (Layout: React.FC<{ children: React.ReactNode }>) =>
  // eslint-disable-next-line @typescript-eslint/ban-types
  <P extends Record<any, any> = {}, IP = P>(
    Page: NextPageWithLayout<P, IP>
  ) => {
    Page.getLayout = (page) => <Layout>{page}</Layout>;

    return Page;
  };
