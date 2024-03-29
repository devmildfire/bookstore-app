import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { NextPage } from 'next';
import { Router } from 'next/router';
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query';

import useToggle from '@/hooks/useToggle';
import PageLoading from '@/components/PageLoading';
import '@/styles/globals.css';

import ModalProvider from '@/components/Modal';
import { setOrGetCartCookie } from '@/utils/cardID';

const MyApp: NextPage<AppProps> = (props) => {
  const [queryClient] = React.useState(() => new QueryClient());
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
  }, [toggleOff, toggleOn]);

  //  при старте работы приложения всем пользователям раздаётся
  //  принудительное cookie с номером их корзины покупок
  useEffect(() => {
    setOrGetCartCookie();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <ModalProvider>
          <>
            <PageLoading show={value} />
            <Component {...pageProps} />
          </>
        </ModalProvider>
      </Hydrate>
    </QueryClientProvider>
  );
};
export default MyApp;
