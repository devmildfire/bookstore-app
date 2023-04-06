import Link from 'next/link';
import * as React from 'react';
import { StyledButton } from './styles';
import { PropsWithChildren } from 'react';

interface IconButtonProps {
  readonly onClick?: () => void;
  readonly href?: string;
  readonly scroll?: boolean;
  readonly shallow?: boolean;
  className?: string;
  size?: string;
}

const IconButton = (
  props: PropsWithChildren<IconButtonProps>,
  ref: React.Ref<HTMLButtonElement | HTMLAnchorElement>
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
          ref={ref}
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

export default React.memo(React.forwardRef(IconButton));
