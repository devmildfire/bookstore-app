import React, { FC } from 'react';
import NextLink from 'next/link';
import Text, { TextProps } from '../Text';
import { StyledLink } from './styles';

export interface LinkProps extends TextProps {
  readonly href: string;
  readonly scroll?: boolean;
}

const Link: FC<LinkProps> = (props) => {
  const {
    children, href, scroll, ...textProps
  } = props;

  return (
    <NextLink href={href} passHref scroll={scroll}>
      <StyledLink href='fakeHref'>
        <Text variant='span' color='inherit' {...textProps}>
          {children}
        </Text>
      </StyledLink>
    </NextLink>
  );
};

export default Link;
