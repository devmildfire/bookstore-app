import * as React from 'react';
import Link, { LinkProps } from './Link';
import { PropsWithChildren } from 'react';

function RedLink(props: PropsWithChildren<LinkProps>) {
  const { children, href } = props;

  return (
    <Link
      href={href}
      className='underline font-bold text-mainred hover:text-red duration-300'
    >
      {children}
    </Link>
  );
}

export default RedLink;
