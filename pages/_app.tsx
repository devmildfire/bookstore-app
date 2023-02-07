import React, {
  useEffect,
  useState,
  createContext,
  Dispatch,
  SetStateAction,
  ReactNode,
} from 'react';
import type { AppProps } from 'next/app';
import { NextPage } from 'next';
import { Router } from 'next/router';
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query';
import styled from 'styled-components';
import * as Dialog from '@radix-ui/react-dialog';

// import PageLayout from '@/layouts/PageLayout';
import { DeviceInfoProvider } from '@/contexts/DeviceInfoContext';
import { wrapper } from '@/models';
import useToggle from '@/hooks/useToggle';
import PageLoading from '@/components/PageLoading';
import '@/styles/globals.css';
import Header from '@/components/PageLayout/Header';
import Footer from '@/components/PageLayout/Footer';

const DialogOverlay = styled(Dialog.Overlay)`
  background-color: #0000009d;
  position: fixed;
  inset: 0;
  animation: overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
`;

const DialogContent = styled(Dialog.Content)`
  background-color: var(--main-black);
  border-radius: 6px;
  box-shadow: hsl(206 22% 7% / 35%) 0px 10px 38px -10px,
    hsl(206 22% 7% / 20%) 0px 10px 20px -15px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  max-width: 450px;
  max-height: 85vh;
  padding: 25px;
  animation: contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
  :focus {
    outline: none;
  }
`;

const DialogTitle = styled.h2`
  font-weight: 500;
  color: var(--mauve12);
  font-size: 17px;
`;

const DialogDescription = styled.p`
  margin: 10px 0 20px;
  color: var(--mauve11);
  font-size: 15px;
  line-height: 1.5;
`;

export const ModalContext = createContext<Dispatch<
  SetStateAction<boolean>
> | null>(null);

function ModalProvider({
  title,
  bookAuthors,
  children,
}: {
  title?: string;
  bookAuthors?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <ModalContext.Provider value={setOpen}>
      {children}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <DialogOverlay />
          <DialogContent>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{bookAuthors}</DialogDescription>
          </DialogContent>
        </Dialog.Portal>
      </Dialog.Root>
    </ModalContext.Provider>
  );
}

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
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <DeviceInfoProvider>
          <ModalProvider>
            {/* <PageLayout> */}
            <Header />
            <>
              {value && <PageLoading />}
              <Component {...pageProps} />
            </>
            {/* </PageLayout> */}
            <Footer />
          </ModalProvider>
        </DeviceInfoProvider>
      </Hydrate>
    </QueryClientProvider>
  );
};
export default wrapper.withRedux(MyApp);
