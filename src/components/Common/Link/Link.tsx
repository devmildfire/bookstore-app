import React, { forwardRef, memo, PropsWithChildren } from 'react';
import NextLink from 'next/link';
import Text, { TextProps } from '../Text';
import { StyledLink } from './styles';

export interface LinkProps extends TextProps {
  readonly href: string;
  readonly scroll?: boolean;
}

const Link = memo(
  forwardRef<HTMLAnchorElement, PropsWithChildren<LinkProps>>((props, ref) => {
    const {
      children, href, scroll, ...textProps
    } = props;

    return (
      <NextLink href={href} passHref scroll={scroll}>
        <StyledLink href='fakeHref' ref={ref}>
          <Text variant='span' color='inherit' {...textProps}>
            {children}
          </Text>
        </StyledLink>
      </NextLink>
    );
  }),
);

export default Link;
