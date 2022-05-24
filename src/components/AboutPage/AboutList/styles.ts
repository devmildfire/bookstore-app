import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';

const StyledList = styled.section`
  display: flex;
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

export default StyledList;
