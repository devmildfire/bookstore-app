import breakPoints from '@/utils/breakPoints';
import styled from 'styled-components';

export const GridContainer = styled.ul`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4rem;
  width: 100%;
  /* TODO(@sergromm): убрать стили для div нужны чтобы спозиционировать дебагер leva */
  & > div {
    top: 80px;
  }

  @media ${breakPoints.sm} {
    gap: 2rem;
  }
`;

export const CardContainer = styled.li`
  transition: 0.1s ease;

  &:focus {
    outline: none;
    box-shadow: 0 0 8px 4px lightgray;
  }
`;

export const Cover = styled.img`
  display: block;
  min-width: 220px;
  max-width: 355px;
  width: 100%;
  object-fit: cover;
  transition: 0.1s ease;

  &:hover {
    transform: translateY(-3%);
    box-shadow: 0 0 8px 4px darkred;
  }
`;
