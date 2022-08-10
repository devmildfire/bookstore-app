import styled from 'styled-components';
import Cart from '@/assets/icons/shop-cart.svg';

export const StyledCart = styled(Cart)`
  display: inline-block;

  width: 20px;
  height: 24px;

  stroke: var(--main-white-100);
  fill: transparent;

  :hover,
  :focus-visible {
    stroke: var(--main-red-100);
  }
`;
