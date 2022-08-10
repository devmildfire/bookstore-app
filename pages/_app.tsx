import React from 'react';
import type { AppProps } from 'next/app';
import PageLayout from '@/components/PageLayout/PageLayout';
import { DeviceInfoProvider } from '@/contexts/DeviceInfoContext';
import { wrapper } from '@/models';

import 'swiper/css';
import 'swiper/css/pagination';
import '@/styles/globals.css';

const MyApp = ({ Component, pageProps, }: AppProps): React.ReactElement => (
  <DeviceInfoProvider>
    <PageLayout>
      <Component {...pageProps} />
    </PageLayout>
  </DeviceInfoProvider>
);
export default wrapper.withRedux(MyApp);
