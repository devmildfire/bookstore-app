import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';

export const StyledWrapper = styled.div`
  display: grid;
  /* gap: 100px; */
  gap: var(--top-div-gap);

  width: 100%;
  position: relative;
  background-color: var(--main-black);
  color: var(--main-white-100);

  /* @media ${breakPoints.xl} {
    gap: 70px;
  }

  @media ${breakPoints.lg} {
    gap: 60px;
  }

  @media ${breakPoints.md} {
    gap: 40px;
  }

  @media ${breakPoints.sm} {
    gap: 30px;
  } */
`;

export const StyledContent = styled.div`
  display: grid;
  gap: 120px;

  width: 100%;
  min-height: 100vh;
`;
