import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';

const StyledProductsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  justify-items: center;
  column-gap: 215px;
  row-gap: 100px;

  @media ${breakPoints.sm} {
    row-gap: 50px;
  }
`;

export default StyledProductsList;
