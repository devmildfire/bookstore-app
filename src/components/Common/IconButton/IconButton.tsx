import Link from 'next/link';
import * as React from 'react';
import { VoidFunction } from '@/types/common';
import { StyledIconButtonProps, StyledButton } from './styles';
import { ClassNameProps } from '@/types/className';
import { PropsWithChildren, RefObject } from 'react';

interface IconButtonProps
  extends Partial<StyledIconButtonProps>,
    ClassNameProps,
    React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly onClick?: VoidFunction;
  readonly href?: string;
  readonly scroll?: boolean;
  readonly shallow?: boolean;
}

const IconButton = (
  props: PropsWithChildren<IconButtonProps>,
  ref: RefObject<HTMLButtonElement | HTMLAnchorElement>
) => {
  const {
    children,
    href,
    onClick,
    className,
    scroll,
    shallow,
    size = 'medium',
    ...rest
  } = props;
  if (href) {
    return (
      <Link href={href} scroll={scroll} shallow={shallow} passHref>
        <StyledButton
          className={className}
          size={size}
          ref={ref as React.ForwardedRef<HTMLAnchorElement>}
          {...(rest as any)}
        >
          {children}
        </StyledButton>
      </Link>
    );
  }
  return (
    <StyledButton
      className={className}
      onClick={onClick}
      size={size}
      ref={ref as React.ForwardedRef<HTMLButtonElement>}
      {...rest}
    >
      {children}
    </StyledButton>
  );
};

export default React.memo(IconButton);
