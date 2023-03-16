import styled from 'styled-components';
import Image from 'next/image';

export const ProductItem = styled.li`
  max-width: 350px;
  width: 100%;
  color: var(--main-white-100);
`;
export const Cover = styled(Image)`
  cursor: pointer;
  transition: 0.15s ease-in-out;
  :hover {
    transform: scale(1.05);
    box-shadow: var(--red-hover);
  }
`;
export const ButtonsContainer = styled.div``;
export const Footer = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 0;
`;
export const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;
interface PriceProps {
  discount?: boolean;
}

export const Price = styled.span<PriceProps>`
  position: relative;
  color: var(--main-white-100);
  font-size: var(--font-xl);
  font-weight: 700;
`;

export const OldPrice = styled(Price)`
  color: var(--main-red-100);
  font-size: var(--font-l);
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

export const Button = styled.button`
  width: 30px;
  height: 30px;
  background-color: transparent;
  color: var(--main-white-100);
  transition: 0.15s;
  cursor: pointer;
  :hover {
    color: var(--main-red-100);
  }
`;
