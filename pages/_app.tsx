import React, { RefObject, useEffect, useRef, useState } from 'react';
import type { AppProps } from 'next/app';
import { NextPage } from 'next';
import { Router, useRouter } from 'next/router';
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query';
import { wrapper } from '@/models';
import useToggle from '@/hooks/useToggle';
import PageLoading from '@/components/PageLoading';
import '@/styles/globals.css';
import Header from '@/components/PageLayout/Header';
import Footer from '@/components/PageLayout/Footer';
import ModalProvider from '@/components/Modal';
import { setOrGetCartCookie } from '@/utils/cardID';

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
  }, [isIntersecting, ref, ref.current, rootMargin]);

  return isIntersecting;
}

const MyApp: NextPage<AppProps> = (props) => {
  const [queryClient] = React.useState(() => new QueryClient());
  const { Component, pageProps } = props;
  const { value, toggleOff, toggleOn } = useToggle();
  const intersectionRef = useRef<HTMLElement>(null);
  // FIXME(@sergromm): что-то не так с отслеживанием баннера.
  // при переключении пути через Link не сбрасывается состояние
  // isSliderOnScreen из-за чего фон хедера остаётся чёрным.
  // Временный фикс: проверять чтобы текущий путь был !'/books'.
  const isSliderOnScreen = useOnScreen(intersectionRef);
  const router = useRouter();
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

  //  при старте работы приложения всем пользователям раздаётся
  //  принудительное cookie с номером их корзины покупок
  useEffect(() => {
    setOrGetCartCookie();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <ModalProvider>
          <Header
            backgroundColor={
              isSliderOnScreen && router.pathname === '/books'
                ? '#050505'
                : 'var(--main-black)'
            }
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
