import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';

export const GridDiv = styled.div`
  display: grid;
  width: 100vw;
  grid-template-rows: 1fr;
  /* grid-template-columns: fit-content 1fr; */
  /* grid-template-columns: 250px 1fr; */
  grid-template-columns: min-content 1fr;
  column-gap: 20px;

  @media ${breakPoints.xl} {
  }

  @media ${breakPoints.lg} {
  }

  @media ${breakPoints.md} {
  }

  @media ${breakPoints.smd} {
  }

  @media ${breakPoints.sm} {
    grid-template-columns: 1fr;
    column-gap: 0px;
  }
`;
