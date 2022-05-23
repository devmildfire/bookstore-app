import React from 'react';
import type { AppProps } from 'next/app';
import DeviceInfoProvider from '../src/components/DeviceInfoProvider';
import PageLayout from '../src/components/PageLayout/PageLayout';

import 'swiper/css';
import 'swiper/css/pagination';
import '../src/Styles/globals.css';

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
