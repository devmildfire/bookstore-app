import styled from 'styled-components';
import Link from '@/components/Common/Link';

export const StyledWrapper = styled(Link)`
  display: block;
  max-width: 355px;

  font-size: 16px;
  line-height: 20px;
  color: var(--main-white);

  background-color: var(--main-black);

  transform-origin: center;

  transition: all 250ms ease-in;

  &:hover,
  &:focus-visible,
  &.active {
    transform: scale(1.05);
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

export const StyledActions = styled.div`
  display: flex;
  align-items: center;
  gap: 40px;
`;
