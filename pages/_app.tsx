import React, { RefObject, useEffect, useRef, useState } from 'react';
import type { AppProps } from 'next/app';
import { NextPage } from 'next';
import { Router } from 'next/router';
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query';

// import PageLayout from '@/layouts/PageLayout';
import { wrapper } from '@/models';
import useToggle from '@/hooks/useToggle';
import PageLoading from '@/components/PageLoading';
import '@/styles/globals.css';
import Header from '@/components/PageLayout/Header';
import Footer from '@/components/PageLayout/Footer';
import ModalProvider from '@/components/Modal';

type Pixels = number;

function useOnScreen(ref: RefObject<HTMLElement>, rootMargin: Pixels = 0) {
  const [isIntersecting, setIntersecting] = useState<boolean>(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIntersecting(entry.isIntersecting),
      {
        rootMargin: `${rootMargin}px`,
      }
    );
    if (!ref.current) return;
    const currentRef = ref.current;
    observer.observe(currentRef);
    return () => {
      observer.unobserve(currentRef);
    };
  }, [ref, rootMargin]);
  // console.log(isIntersecting);
  return isIntersecting;
}

const MyApp: NextPage<AppProps> = (props) => {
  const [queryClient] = React.useState(() => new QueryClient());
  const { Component, pageProps } = props;
  const { value, toggleOff, toggleOn } = useToggle();
  const intersectionRef = useRef<HTMLElement>(null);
  const isSliderOnScreen = useOnScreen(intersectionRef);

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
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <ModalProvider>
          {/* <PageLayout> */}
          <Header
            backgroundColor={isSliderOnScreen ? '#050505' : 'var(--main-black)'}
          />
          <>
            {value && <PageLoading />}
            <Component {...pageProps} forwardedRef={intersectionRef} />
          </>
          {/* </PageLayout> */}
          <Footer />
        </ModalProvider>
      </Hydrate>
    </QueryClientProvider>
  );
};
export default wrapper.withRedux(MyApp);
