import styled from 'styled-components';
import Row from '@/components/Common/Row';

export const StyledWrapper = styled.div`
  display: grid;
  gap: 30px;
`;

interface StyledRowProps {
  readonly inRow: number;
}

export const StyledRow = styled(Row)<StyledRowProps>`
  grid-template-columns: repeat(auto-fit, 430px);
  gap: calc(
    (var(--width) - 430px * ${(props) => props.inRow}) /
      ${(props) => props.inRow - 1}
  );
`;
