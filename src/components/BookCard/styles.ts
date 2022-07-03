import styled from 'styled-components';
import Like from '@/assets/icons/like.svg';
import ShopCart from '@/assets/icons/shop-cart.svg';

export const StyledWrapper = styled.article`
  width: 355px;

  font-size: 16px;
  line-height: 20px;
  color: var(--main-white);

  background-color: var(--main-black);

  transform-origin: center;

  transition: all 250ms ease-in;

  :hover,
  :focus-visible {
    transform: scale(1.15);

    box-shadow: 10px 10px 40px var(--main-red-30),
      -10px -10px 40px var(--main-red-30);
  }

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

export const StyledInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 18px 35px;
`;

export const StyledImage = styled.img`
  width: 100%;
  height: 533px;

  object-fit: cover;
`;

export const StyledPriceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 17px;

  width: max-content;
`;

export const StyledIcons = styled.div`
  display: flex;
  align-items: center;
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
