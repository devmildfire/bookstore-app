import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import CartIcon from '@/assets/icons/shop-cart.svg';
import { StyledIcon } from './styles';

const Cart: React.FC<ClassNameProps> = (props) => {
  return (
    <StyledIcon {...props}>
      <CartIcon />
    </StyledIcon>
  );
};

export default React.memo(Cart);
