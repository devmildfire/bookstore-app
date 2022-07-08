import React from 'react';
import type { AppProps } from 'next/app';
import { AnimatePresence } from 'framer-motion';
import PageLayout from '@/components/PageLayout/PageLayout';
import { DeviceInfoProvider } from '@/contexts/DeviceInfoContext';
import { wrapper } from '@/models';

import 'swiper/css';
import 'swiper/css/pagination';
import '@/styles/globals.css';

function MyApp({ Component, pageProps }: AppProps): React.ReactElement {
  return (
    <DeviceInfoProvider>
      <AnimatePresence initial={false} exitBeforeEnter>
        <PageLayout>
          <Component {...pageProps} />
        </PageLayout>
      </AnimatePresence>
    </DeviceInfoProvider>
  );
}
export default wrapper.withRedux(MyApp);
