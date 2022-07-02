import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import stars from '@/assets/images/stars.webp';

export const StyledWrapper = styled.main`
  --marginBottom: 170px;
  --lastMarginBottom: 250px;
  display: flex;
  flex-direction: column;
  padding-top: 40px;

  & > :not(:last-child) {
    margin-bottom: var(--marginBottom);
  }

  & > :last-child {
    padding-bottom: var(--lastMarginBottom);
  }

  @media ${breakPoints.xl} {
    --marginBottom: 150px;
  }

  @media ${breakPoints.lg} {
    --marginBottom: 100px;
    --lastMarginBottom: 200px;
  }

  @media ${breakPoints.md} {
    --marginBottom: 85px;
    --lastMarginBottom: 175px;
  }

  @media ${breakPoints.sm} {
    padding-top: 20px;
    --marginBottom: 70px;
    --lastMarginBottom: 150px;
  }
`;

export const StyledStarsBlock = styled.section`
  background-image: url(${stars.src});
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;

  & > :not(:last-child) {
    margin-bottom: var(--marginBottom);
  }
`;
