import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';

const StyledWrapper = styled.section`
  display: grid;
  gap: 64px;

  @media ${breakPoints.xl} {
    gap: 50px;
  }

  @media ${breakPoints.lg} {
    gap: 50px;
  }

  @media ${breakPoints.md} {
    gap: 30px;
  }

  @media ${breakPoints.sm} {
    gap: 10px;
  }
`;

export default StyledWrapper;
