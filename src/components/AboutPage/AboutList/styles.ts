import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import Slide from '@/components/Common/Slide';

export const StyledList = styled.section`
  display: flex;
  justify-content: space-between;
  gap: 105px;
  max-width: 1440px;
  width: 100%;

  @media ${breakPoints.xl} {
    gap: 10px;
  }

  @media ${breakPoints.lg} {
    gap: 7px;
  }

  @media ${breakPoints.md} {
    gap: 4px;
  }

  @media ${breakPoints.sm} {
    gap: 0px;
    flex-direction: column;
    align-items: flex-start;
    --width: 285px;
    width: var(--width);
    margin: auto;
  }
`;

export const StyledSlide = styled(Slide)`
  align-items: center;
`;

StyledSlide.displayName = Slide.displayName;
