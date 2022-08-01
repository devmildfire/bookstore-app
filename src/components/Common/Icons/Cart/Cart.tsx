import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { StyledCart } from './styles';

type CartProps = ClassNameProps

const Cart: React.FC<CartProps> = (props) => {
  const { className } = props;
  return <StyledCart className={className} />;
};

export default React.memo(Cart);
