import styled from 'styled-components';
import Image from '@/components/Common/Image';
import ProductCard from '@/components/Common/ProductCard';

export const StyledWrapper = styled(ProductCard)`
  display: block;
  max-width: 355px;

  font-size: 16px;
  line-height: 20px;
  color: var(--main-white-100);

  background-color: var(--main-black);
`;

export const StyledInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 18px 35px;
`;

export const StyledImage = styled(Image)`
  height: 533px;
`;

export const StyledActions = styled.div`
  display: flex;
  align-items: center;
  gap: 40px;
`;
