import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import Button from '@/components/Common/Button';

export const StyledForm = styled.form`
  display: grid;
  grid-template-columns: min-content min-content;
  gap: 20px;

  margin: 0 auto;

  @media ${breakPoints.md} {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

export const StyledButton = styled(Button)`
  @media ${breakPoints.sm} {
    width: 100%;
  }
`;
