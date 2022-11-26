import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import Button from '@/components/Common/Button';

export const StyledForm = styled.form`
  display: grid;
  grid-template-columns: minmax(220px, 300px) min-content;
  gap: 42px;
  margin: 0 auto;

  @media ${breakPoints.md} {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

export const StyledButton = styled(Button)`
  max-width: 900px;

  @media ${breakPoints.xl} {
    max-width: 720px;
  }

  @media ${breakPoints.lg} {
    max-width: 570px;
  }

  @media ${breakPoints.md} {
    width: 100%;
  }
`;
