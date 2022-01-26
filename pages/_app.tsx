import React from 'react';
import type { AppProps } from 'next/app';

import PageLayout from '../src/components/PageLayout/PageLayout';

// import '../src/styles/globals.css';

function MyApp({ Component, pageProps }: AppProps): React.ReactElement {
  return (
    <PageLayout>
      <Component {...pageProps} />
    </PageLayout>
  );
}
export default MyApp;
