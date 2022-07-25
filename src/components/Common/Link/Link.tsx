import * as React from 'react';
import NextLink from 'next/link';
import { StyledLink } from './styles';
import { ClassNameProps } from '@/types/className';

export interface LinkProps extends ClassNameProps {
  readonly href: string;
  readonly scroll?: boolean;
}

const Link = React.forwardRef<
  HTMLAnchorElement,
  React.PropsWithChildren<LinkProps>
>((props, ref) => {
  const {
    children, href, scroll, className,
  } = props;

  return (
    <NextLink href={href} passHref scroll={scroll}>
      <StyledLink href='fakeHref' ref={ref} className={className}>
        {children}
      </StyledLink>
    </NextLink>
  );
});

export default Link;
