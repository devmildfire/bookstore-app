import styled from 'styled-components';
import List from '@/components/Common/List';

export const StyledWrapper = styled.div`
  padding: 90px 0;
`;

export const StyledList = styled(List)`
  grid-template-columns: repeat(3, 1fr);
  gap: 56px 150px;
`;
