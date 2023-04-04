import * as React from 'react';
import NextLink from 'next/link';
// import { StyledLink } from './styles';
import { ClassNameProps } from '@/types/className';
import { PropsWithChildren, RefObject } from 'react';

export interface LinkProps extends ClassNameProps {
  readonly href: string;
  readonly scroll?: boolean;
  readonly shallow?: boolean;
}

function Link(
  props: PropsWithChildren<LinkProps>,
  ref: RefObject<HTMLAnchorElement>
) {
  const { children, href, scroll, className, shallow } = props;

  return (
    <NextLink
      ref={ref}
      href={href}
      passHref
      scroll={scroll}
      shallow={shallow}
      className={className}
    >
      {children}
    </NextLink>
  );
}

export default Link;
