import Link from 'next/link';
import * as React from 'react';
import { VoidFunction } from '@/types/common';
import { StyledIconButtonProps, StyledButton } from './styles';
import { ClassNameProps } from '@/types/className';

interface IconButtonProps
  extends Partial<StyledIconButtonProps>,
    ClassNameProps,
    React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly onClick?: VoidFunction;
  readonly href?: string;
  readonly scroll?: boolean;
}

const IconButton = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  React.PropsWithChildren<IconButtonProps>
>((props, ref) => {
  const {
    children,
    href,
    onClick,
    className,
    scroll,
    size = 'medium',
    ...rest
  } = props;
  if (href) {
    return (
      <Link href={href} scroll={scroll} passHref>
        <StyledButton
          className={className}
          as='a'
          href='fakeHref'
          size={size}
          ref={ref as React.ForwardedRef<HTMLAnchorElement>}
          {...rest as any}
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
});

export default React.memo(IconButton);
