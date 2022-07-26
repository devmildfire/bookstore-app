import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import InfinityList from '@/components/InfinityList';

export const StyledProductsList = styled(InfinityList)`
  row-gap: 100px;

  @media ${breakPoints.sm} {
    row-gap: 50px;
  }
`;
