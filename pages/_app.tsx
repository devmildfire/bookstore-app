import React from 'react';
import type { AppProps } from 'next/app';
import { NextPage } from 'next';
import PageLayout from '@/layouts/PageLayout';
import { DeviceInfoProvider } from '@/contexts/DeviceInfoContext';
import { wrapper } from '@/models';

import 'swiper/css';
import 'swiper/css/pagination';
import '@/styles/globals.css';

const MyApp: NextPage<AppProps> = (props) => {
  const { Component, pageProps, } = props;
  return (
    <DeviceInfoProvider>
      <PageLayout>
        <Component {...pageProps} />
      </PageLayout>
    </DeviceInfoProvider>
  );
};
export default wrapper.withRedux(MyApp);
