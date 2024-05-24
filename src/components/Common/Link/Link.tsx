import * as React from 'react';
import NextLink from 'next/link';
// import { StyledLink } from './styles';
import { ClassNameProps } from '@/types/className';
import { PropsWithChildren } from 'react';

export interface LinkProps extends ClassNameProps {
  readonly href: string;
  readonly scroll?: boolean;
  readonly shallow?: boolean;
  target?: string;
}

function Link(
  props: PropsWithChildren<LinkProps>,
  ref: React.Ref<HTMLAnchorElement>
) {
  const { children, href, scroll, className, shallow, target } = props;

  return (
    <NextLink
      ref={ref}
      href={href}
      passHref
      scroll={scroll}
      shallow={shallow}
      className={className}
      target={target}
    >
      {children}
    </NextLink>
  );
}

export default React.forwardRef(Link);
