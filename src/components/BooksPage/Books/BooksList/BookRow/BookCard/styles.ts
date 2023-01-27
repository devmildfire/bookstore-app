import styled from 'styled-components';
import Image from '@/components/Common/Image';
import ProductCard from '@/components/Common/ProductCard';
import IconButton from '@/components/Common/IconButton';
import Like from '@/components/Common/Icons/Like';
import Link from '@/components/Common/Link';

export const StyledWrapper = styled(ProductCard)`
  display: grid;

  font-size: 16px;
  line-height: 20px;
  color: var(--main-white-100);

  background-color: var(--main-black);
`;

export const StyledInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 0;
`;

export const StyledImageLink = styled(Link)`
  width: 100%;
  height: 533px;
`;

export const StyledImage = styled(Image)`
  height: 100%;
  width: 100%;
`;

export const StyledActions = styled.div`
  display: flex;
  align-items: center;
  gap: 40px;
`;

export const StyledIconButton = styled(IconButton)`
  color: var(--main-white-100);

  :hover,
  :focus-visible {
    color: var(--main-red-100);
  }
`;

interface StyledLikeIconProps {
  readonly isActive: boolean;
}

export const StyledLikeIcon = styled(Like)<StyledLikeIconProps>`
  ${(props) => (props.isActive ? 'color : var(--main-red-100);' : '')}
`;
