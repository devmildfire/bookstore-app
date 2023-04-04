import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { StyledWrapper } from './styles';
import { PropsWithChildren } from 'react';

interface MenuProps extends ClassNameProps {
  readonly isOpen: boolean;
  readonly target: HTMLElement | null;
}

const Menu: React.FC<PropsWithChildren<MenuProps>> = (props) => {
  const { children, className, isOpen, ...rest } = props;
  if (!rest.target || !isOpen) {
    return null;
  }
  return <StyledWrapper className={className}>{children}</StyledWrapper>;
};

export default Menu;
