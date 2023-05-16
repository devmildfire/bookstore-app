import React, { RefObject, useEffect, useRef, useState } from 'react';
import type { AppProps } from 'next/app';
import { NextPage } from 'next';
import { Router } from 'next/router';
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query';
import { wrapper } from '@/models';
import useToggle from '@/hooks/useToggle';
import PageLoading from '@/components/PageLoading';
import '@/styles/globals.css';
import Header from '@/components/PageLayout/Header';
import Footer from '@/components/PageLayout/Footer';
import ModalProvider from '@/components/Modal';
import { userAgent } from 'next/server';

function useOnScreen(ref: RefObject<Element>, rootMargin = '0px') {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const element = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIntersecting(entry.isIntersecting);
      },
      {
        rootMargin,
      }
    );
    observer.observe(element);
    return () => {
      observer.unobserve(element);
    };
  }, [isIntersecting, ref.current, ref, rootMargin]);

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

    // Отключение поворота экрана для мобильых.
    // Возможно врменно, пока не появится адаптив.
    // Работает только если запросить полноэкранный режим у браузера.
    // Что, скорее всего, будет немного раздражать.
    async function lockOrientation() {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      await screen.orientation.lock('portrait');
    }
    screen.orientation.addEventListener('change', lockOrientation);

    return () => {
      screen.orientation.removeEventListener('change', lockOrientation);

      Router.events.off('routeChangeStart', toggleOn);
      Router.events.off('routeChangeError', toggleOff);
      Router.events.off('routeChangeComplete', toggleOff);
    };
  }, [toggleOff, toggleOn, isSliderOnScreen]);

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <ModalProvider>
          <Header
            backgroundColor={isSliderOnScreen ? '#050505' : 'var(--main-black)'}
          />
          <>
            {value && <PageLoading />}
            <Component {...pageProps} forwardedRef={intersectionRef} />
          </>
          <Footer />
        </ModalProvider>
      </Hydrate>
    </QueryClientProvider>
  );
};
export default wrapper.withRedux(MyApp);
