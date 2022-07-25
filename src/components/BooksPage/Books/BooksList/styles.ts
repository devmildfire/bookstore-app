import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import List from '@/components/Common/List';

export const StyledProductsList = styled(List)`
  position: relative;

  row-gap: 100px;

  @media ${breakPoints.sm} {
    row-gap: 50px;
  }
`;

export const StyledIntersectingElement = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  left: 0;
`;
