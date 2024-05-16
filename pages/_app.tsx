import React, { Suspense, useEffect, useState } from 'react';
import type { AppProps } from 'next/app';
import { NextPage } from 'next';
import { Router, useRouter } from 'next/router';
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query';

import useToggle from '@/hooks/useToggle';
import PageLoading from '@/components/PageLoading';
import '@/styles/globals.css';

import ModalProvider from '@/components/Modal';
import { setOrGetCartCookie } from '@/utils/cardID';
import { ThemeProvider } from '@/components/providers';
import { Toaster } from '@/components/ui/toast';
import { AppPropsWithLayout } from '@/types/page';

import { supabase } from 'api/supabase-client';
import { User } from '@supabase/supabase-js';

import {
  // TitlesStore,
  titlesStore,
  // titlesStore,
} from '@/store/locals/dashboard/TitlesStore/TitlesStore';
import { filtersStore } from '@/store/locals/dashboard/FiltersStore/FiltersStore';
import { Observer, observer } from 'mobx-react-lite';
// import { MultipleStoresProvider } from '@/store/locals/dashboard/TitlesStore/context';
// import { useLocalStore } from '@/store/hooks/useLocalStore';
// import { FiltersStore } from '@/store/locals/dashboard/FiltersStore';

const MyApp: NextPage<AppProps> = observer((props: AppPropsWithLayout) => {
  const [queryClient] = React.useState(() => new QueryClient());
  const { Component, pageProps } = props;
  // console.log(pageProps);
  const { value, toggleOff, toggleOn } = useToggle();
  const getLayout = Component.getLayout ?? ((page) => page);
  const [user, setUser] = useState<User>();

  const get_user = async (): Promise<User | undefined> => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error(error);
    } else {
      // data.user && console.log('current user is ... ', data.user);
      return data.user;
    }
  };

  const anonymousLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInAnonymously({
        options: {
          data: {
            cartID: setOrGetCartCookie(),
          },
        },
      });
      if (error) {
        console.error(error);
      } else {
        // data.session && console.log('session data is... ', data.session);
        // data.user && console.log('user data is... ', data.user);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getUserData = async () => {
    const user = await get_user();
    user && setUser(user);
    !user && anonymousLogin();
  };

  // const titlesStoreFromContext = useLocalStore(() => new TitlesStore());
  // titlesStoreFromContext.load();

  // const filtersStoreFromContext = useLocalStore(() => new FiltersStore());
  // filtersStoreFromContext.set({
  //   authors: [],
  //   years: [],
  //   types: [],
  // });

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

  //  также проверяется есть ли текущий пользователь
  //  если нет, то происходит логин анонимного пользователя
  useEffect(() => {
    setOrGetCartCookie();
    getUserData();
    // это стор из "синглтона", он работает
    titlesStore.load();
    filtersStore.set({
      authors: [],
      years: [],
      types: [],
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <ModalProvider>
          <ThemeProvider attribute='class' defaultTheme='dark' enableSystem>
            <PageLoading show={!(titlesStore.isLoaded || value)} />

            {titlesStore.isLoaded &&
              !value &&
              getLayout(<Component {...pageProps} />)}
            <Toaster />
          </ThemeProvider>
        </ModalProvider>
      </Hydrate>
    </QueryClientProvider>
  );
});

export default MyApp;
