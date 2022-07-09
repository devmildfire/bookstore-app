import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';

export const StyledProductsList = styled.div`
  display: grid;

  row-gap: 100px;

  @media ${breakPoints.sm} {
    row-gap: 50px;
  }
`;
