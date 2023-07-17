import React, { RefObject, useEffect, useRef, useState } from 'react';
import type { AppProps } from 'next/app';
import { NextPage } from 'next';
import { Router, useRouter } from 'next/router';
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query';

// import PageLayout from '@/layouts/PageLayout';
import { wrapper } from '@/models';
import useToggle from '@/hooks/useToggle';
import PageLoading from '@/components/PageLoading';
import '@/styles/globals.css';
import Header from '@/components/PageLayout/Header';
import Footer from '@/components/PageLayout/Footer';
import ModalProvider from '@/components/Modal';

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

    return () => {
      Router.events.off('routeChangeStart', toggleOn);
      Router.events.off('routeChangeError', toggleOff);
      Router.events.off('routeChangeComplete', toggleOff);
    };
  }, [toggleOff, toggleOn, isSliderOnScreen]);

  const smallRouter = useRouter();
  //  условие для непоказывания футера - путь страницы контактов
  const dontShowFooter = smallRouter.pathname === '/contacts';

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

          {/* показываем футер, только если ложно условие его непоказывания */}
          {dontShowFooter || <Footer />}
        </ModalProvider>
      </Hydrate>
    </QueryClientProvider>
  );
};
export default wrapper.withRedux(MyApp);
