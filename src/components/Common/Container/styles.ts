import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';

const StyledContainer = styled.div`
  --width: 1400px;
  position: relative;
  max-width: var(--width);
  width: 100%;
  margin: 0 auto;

  @media ${breakPoints.xl} {
    --width: 1024px;
  }

  @media ${breakPoints.lg} {
    --width: 830px;
  }

  @media ${breakPoints.md} {
    --width: 580px;
  }

  @media ${breakPoints.sm} {
    --width: 300px;
  }
`;

export default StyledContainer;
