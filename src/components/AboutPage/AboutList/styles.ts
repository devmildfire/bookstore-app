import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import Slide from '@/components/Common/Slide';

export const StyledList = styled.section`
  display: flex;
  justify-content: space-between;
  gap: 16px;

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
  }
`;

export const StyledSlide = styled(Slide)`
  align-items: center;
`;

StyledSlide.displayName = Slide.displayName;
