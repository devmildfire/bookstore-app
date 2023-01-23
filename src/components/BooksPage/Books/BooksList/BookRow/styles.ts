import styled from 'styled-components';
import Row from '@/components/Common/Row';

export const StyledRowWrapper = styled.div`
  display: grid;
  gap: 30px;
`;

interface StyledRowProps {
  readonly inRow: number;
}

export const StyledRow = styled(Row)<StyledRowProps>`
  justify-content: space-between;
  grid-template-columns: repeat(auto-fit, 355px);
`;
