import React from 'react';
import type { AppProps } from 'next/app';
import DeviceInfoProvider from '@/components/DeviceInfoProvider';
import PageLayout from '@/components/PageLayout/PageLayout';

import 'swiper/css';
import 'swiper/css/pagination';
import '@/styles/globals.css';

function MyApp({ Component, pageProps }: AppProps): React.ReactElement {
  return (
    <DeviceInfoProvider>
      <PageLayout>
        <Component {...pageProps} />
      </PageLayout>
    </DeviceInfoProvider>
  );
}
export default MyApp;
