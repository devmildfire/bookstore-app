import styled from 'styled-components';
import GiftsList from './GiftsList';

export const StyledWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 70px 30px;
`;

export const StyledList = styled(GiftsList)`
  grid-column: span 2;
`;
