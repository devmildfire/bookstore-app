import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import Popper from '../Popper';
import { StyledWrapper } from './styles';

interface MenuProps extends ClassNameProps {
  readonly isOpen: boolean;
  readonly target: HTMLElement | null;
}

const Menu: React.FC<MenuProps> = (props) => {
  const { children, className, isOpen, ...rest } = props;
  console.log('[Target]', rest.target);
  if (!rest.target || !isOpen) {
    return null;
  }
  return (
    <Popper {...rest}>
      <StyledWrapper className={className}>{children}</StyledWrapper>
    </Popper>
  );
};

export default Menu;
