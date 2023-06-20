import Link from 'next/link';
import React, { ButtonHTMLAttributes, memo, PropsWithChildren } from 'react';
import Text from '../Text';
import { StyledButton, StyledButtonProps } from './styles';

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement & HTMLAnchorElement>,
    Partial<StyledButtonProps> {
  readonly href?: string;
  readonly scroll?: boolean;
}

const Button = (props: PropsWithChildren<ButtonProps>) => {
  const {
    children,
    className,
    href,
    scroll,
    variant = 'standard',
    ...params
  } = props;

  if (href) {
    return (
      <Link href={href} scroll={scroll} className={className}>
        <StyledButton variant={variant} {...params}>
          <Text variant='text' textColor='inherit' key={0}>
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
