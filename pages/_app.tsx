import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { NextPage } from 'next';
import { Router } from 'next/router';
import PageLayout from '@/layouts/PageLayout';
import { DeviceInfoProvider } from '@/contexts/DeviceInfoContext';
import { wrapper } from '@/models';
import useToggle from '@/hooks/useToggle';
import PageLoading from '@/components/PageLoading';

import '@/styles/globals.css';

const MyApp: NextPage<AppProps> = (props) => {
  const { Component, pageProps } = props;
  const { value, toggleOff, toggleOn } = useToggle();

  useEffect(() => {
    Router.events.on('routeChangeStart', toggleOn);
    Router.events.on('routeChangeError', toggleOff);
    Router.events.on('routeChangeComplete', toggleOff);

    return () => {
      Router.events.off('routeChangeStart', toggleOn);
      Router.events.off('routeChangeError', toggleOff);
      Router.events.off('routeChangeComplete', toggleOff);
    };
  }, []);

  return (
    <DeviceInfoProvider>
      <PageLayout>
        {value && <PageLoading />}
        <Component {...pageProps} />
      </PageLayout>
    </DeviceInfoProvider>
  );
};
export default wrapper.withRedux(MyApp);
