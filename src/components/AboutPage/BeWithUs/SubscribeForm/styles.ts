import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import Button from '@/components/Common/Button';

export const StyledForm = styled.form`
  display: grid;
  grid-template-columns: minmax(220px, 630px) min-content;
  column-gap: 42px;
  row-gap: 15px;
  margin: 0 auto;

  @media ${breakPoints.md} {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

export const StyledButton = styled(Button)`
  margin: 0 auto;
  @media ${breakPoints.md} {
    width: 100%;

    /* max-width: var(--width); */
  }

  @media ${breakPoints.smd} {
    width: 310px;
    max-width: var(--width);
    margin: 0 auto;
  }

  @media ${breakPoints.sm} {
    width: 200px;
    max-width: var(--width);
    margin: 0 auto;
  }
`;
