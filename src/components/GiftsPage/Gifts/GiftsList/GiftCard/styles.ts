import styled from 'styled-components';
import Price from '@/components/Common/Price';
import ProductCard from '@/components/Common/ProductCard';
import IconButton from '@/components/Common/IconButton(depricated';

export const StyledWrapper = styled(ProductCard)`
  display: grid;
  gap: 22px;
`;

export const StyledImageWrapper = styled.div`
  position: relative;

  width: 440px;
  height: 280px;

  background: linear-gradient(
    277.91deg,
    rgba(0, 0, 0, 0.5) 0%,
    rgba(255, 255, 255, 0.5) 89.56%
  );

  border-radius: 10px;

  overflow: hidden;
`;

export const StyledPrice = styled(Price)`
  position: absolute;
  bottom: 40px;
  right: 40px;
`;

export const StyledInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const StyledActions = styled.div`
  display: flex;
  gap: 30px;
  align-items: center;
`;

export const StyledIconButton = styled(IconButton)`
  color: var(--main-white-100);

  :hover,
  :focus-visible {
    color: var(--main-red-100);
  }
`;
