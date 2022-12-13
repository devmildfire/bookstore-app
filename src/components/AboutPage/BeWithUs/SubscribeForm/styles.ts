import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import Button from '@/components/Common/Button';

export const StyledForm = styled.form`
  display: grid;
  grid-template-columns: minmax(220px, 630px) min-content;
  column-gap: 42px;
  row-gap: 15px;
  margin: 0 auto;

  /* @media ${breakPoints.md} {
    grid-template-columns: 1fr;
    gap: 15px;
    row-gap: 4px;
  } */

  @media ${breakPoints.sm} {
    grid-template-columns: 1fr;
    gap: 4px;
    row-gap: 4px;
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
    width: 150px;
    max-width: var(--width);
    min-width: 150px;
    margin: 0 auto;
  }
`;
