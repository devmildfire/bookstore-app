import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import List from '@/components/Common/List';

export const StyledProductsList = styled(List)`
  row-gap: 100px;

  @media ${breakPoints.sm} {
    row-gap: 50px;
  }
`;
