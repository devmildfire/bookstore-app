// import Link from 'next/link';
import React, { ButtonHTMLAttributes, memo, PropsWithChildren } from 'react';
import Text from '../Text';
import { StyledButton, StyledButtonProps, StyledLink } from './styles';
import Link from 'next/link';

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement & HTMLAnchorElement>,
    Partial<StyledButtonProps> {
  readonly href?: string;
  readonly target?: string;
  readonly scroll?: boolean;
}

const Button = (props: PropsWithChildren<ButtonProps>) => {
  const {
    children,
    className,
    href,
    target,
    scroll,
    variant = 'standard',
    ...params
  } = props;

  if (href) {
    return (
      <Link href={href} scroll={scroll} target={target}>
        <StyledButton variant={variant} {...params}>
          <Text variant='buttonText' textColor='inherit' key={0}>
            {children}
          </Text>
        </StyledButton>
      </Link>
    );
  }

  return (
    <StyledButton {...params} variant={variant} className={className}>
      <Text variant='buttonText' textColor='inherit' key={0}>
        {children}
      </Text>
      {/* {children} */}
    </StyledButton>
  );
};

export default memo(Button);
