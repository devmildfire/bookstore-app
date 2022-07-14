import styled from 'styled-components';
import ShopCart from '@/assets/icons/shop-cart.svg';
import Link from '@/components/Common/Link';
import Like from '@/assets/icons/like.svg';

export const StyledWrapper = styled(Link)`
  display: grid;

  grid-template-rows: 1fr min-content;
  gap: 20px;

  width: 430px;
  height: 430px;

  padding: 20px 40px;

  background: linear-gradient(
    315.47deg,
    rgba(62, 62, 62, 0.5) -0.84%,
    rgba(0, 0, 0, 0.5) 100%
  );
  border-radius: 4px;
`;

export const StyledDescription = styled.div`
  align-self: end;

  display: grid;
  grid-template-rows: 1fr max-content;
  gap: 14px;
`;

export const StyledInfo = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const StyledActions = styled.div`
  display: flex;
  gap: 40px;
`;

export const StyledShopCard = styled(ShopCart)`
  width: 24px;
  height: 28px;
  stroke: var(--main-white);

  :focus-visible {
    outline: none;
  }
`;

export const StyledLike = styled(Like)`
  width: 30px;
  height: 25px;
  fill: var(--${(props) => (props.liked ? 'main-red-100' : 'main-white')});

  transition: fill 0.2 ease-in-out;

  :hover,
  :focus-visible {
    fill: var(--${(props) => (props.liked ? 'main-white' : 'main-red-100')});
  }

  :focus-visible {
    outline: none;
  }
`;
