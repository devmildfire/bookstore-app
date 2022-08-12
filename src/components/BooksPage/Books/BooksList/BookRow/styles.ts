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
  grid-template-columns: repeat(auto-fit, 355px);
  gap: calc(
    (var(--width) - 355px * ${(props) => props.inRow}) /
      ${(props) => props.inRow - 1}
  );
`;
