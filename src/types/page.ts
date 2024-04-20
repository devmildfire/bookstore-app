import { NextPage } from 'next';
import { AppProps } from 'next/app';

export type NextPageWithLayout<
  // eslint-disable-next-line @typescript-eslint/ban-types
  P extends Record<any, any> = {},
  IP = P
> = NextPage<P, IP> & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

export type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};
