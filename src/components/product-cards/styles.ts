import styled from 'styled-components';
import Image from 'next/image';
import breakPoints from '@/utils/breakPoints';
import { Trigger } from '../Common/Trigger';

export const ProductItem = styled.li`
  max-width: 350px;
  width: 100%;
  color: var(--main-white-100);
  outline: none;
`;
export const Cover = styled(Image)`
  cursor: pointer;
  outline: none;
  transition: 0.15s ease-in-out;
  :hover,
  :focus {
    transform: scale(1.05);
    box-shadow: var(--red-hover);
  }
`;
export const ButtonsContainer = styled.div<{ negMargin?: number }>`
  display: flex;
  margin-right: ${(props) => (props.negMargin ? `-${props.negMargin}px` : `0`)};
`;
export const Footer = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 0;
  gap: 10px;
`;
export const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: clamp(8px, 1vw, 1rem);
  @media screen and (max-width: 1070px) {
    flex-direction: column-reverse;
    gap: 0;
  }

  @media ${breakPoints.sm} {
    gap: clamp(8px, 1vw, 1rem);
    flex-direction: row;
  }
`;

interface PriceProps {
  discount?: number;
}

export const Price = styled.span`
  position: relative;
  color: var(--main-white-100);
  font-size: clamp(18px, 3vw, 24px);
  font-weight: 700;
`;

export const OldPrice = styled(Price)<PriceProps>`
  display: ${(props) => (props.discount !== 0 ? 'block' : 'none')};

  color: var(--main-red-100);
  font-size: var(--font-l);
  font-size: clamp(14px, 3vw, 20px);
  ::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: linear-gradient(
      -18deg,
      transparent 0,
      transparent calc(50% - 1px),
      var(--main-red-100) calc(50% - 1px),
      var(--main-red-100) calc(50% + 1px),
      transparent calc(50% + 1px)
    );
  }
`;

export const Button = styled(Trigger)`
  gap: 8px;
  font-size: clamp(12px, 2vw, 16px);
  padding: clamp(8px, 1vw, 12px) clamp(8px, 1vw, 20px) clamp(6px, 1vw, 10px);

  @media ${breakPoints.sm} {
    /* padding: 6px 8px 4px; */
  }
`;
