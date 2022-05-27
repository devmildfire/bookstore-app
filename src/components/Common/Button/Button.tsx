import classNames from 'classnames';
import Link from 'next/link';
import React, { ButtonHTMLAttributes, memo, PropsWithChildren } from 'react';
import Text from '../Text';
import { StyledButton, StyledButtonProps } from './styles';
import { StyleVariant } from './types';

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    Partial<StyledButtonProps> {
  readonly href?: string;
  readonly styleVariant?: StyleVariant;
}

const Button = (props: PropsWithChildren<ButtonProps>) => {
  const {
    children,
    className,
    href,
    rounded = false,
    variant = 'standard',
    styleVariant = 'filled',
    ...params
  } = props;
  const classes = classNames(styleVariant, className);
  return (
    <StyledButton
      {...params}
      variant={variant}
      rounded={rounded}
      className={classes}
    >
      <Text variant='span' color='inherit' key={0}>
        {href ? (
          <Link href={href} passHref>
            <a href='fakeHref'>{children}</a>
          </Link>
        ) : (
          children
        )}
      </Text>
    </StyledButton>
  );
};

export default memo(Button);
