import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';

export const GridDiv = styled.div`
  display: grid;
  width: 100%;
  grid-template-rows: 1fr;
  grid-template-columns: min-content 1fr;
  
  @media ${breakPoints.xl} {
  }

  @media ${breakPoints.lg} {
  }

  @media ${breakPoints.md} {
  }

  @media ${breakPoints.smd} {
    grid-template-columns: 1fr;
  }

  @media ${breakPoints.sm} {
    /* column-gap: 0px; */
  }
`;
