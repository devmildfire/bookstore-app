import styled from 'styled-components';
import List from '@/components/Common/List';

export const StyledList = styled(List)`
  grid-template-columns: repeat(3, max-content);
  justify-content: space-between;
`;
