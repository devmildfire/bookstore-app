import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import Button from '@/components/Common/Button';

export const StyledForm = styled.form`
  display: grid;
  grid-template-columns: auto min-content;
  column-gap: 24px;
  row-gap: 10px;
  margin: 0 auto;
  max-width: 879px;

  @media ${breakPoints.lg} {
    grid-template-columns: auto min-content;
    column-gap: 12px;
    row-gap: 5px;
    max-width: 612px;
  }

  @media ${breakPoints.md} {
    grid-template-columns: auto min-content;
    column-gap: 12px;
    row-gap: 5px;
    max-width: 400px;
  }

  @media ${breakPoints.smd} {
    grid-template-columns: auto fit-content();
    column-gap: 12px;
    row-gap: 5px;
    max-width: 400px;
  }

  @media ${breakPoints.sm} {
    grid-template-columns: 1fr;
    gap: 4px;
    row-gap: 16px;
  }
`;

export const StyledButton = styled(Button)`
  /* margin: 0 auto; */

  @media ${breakPoints.lg} {
    /* width: 100%; */
    /* max-width: var(--width); */
    max-width: 185px;
    min-width: 185px;

    height: 45px;
    min-height: 45px;
    /* margin: 0 auto; */
  }

  @media ${breakPoints.smd} {
    /* width: 100%; */
    /* max-width: var(--width); */
    max-width: 150px;
    min-width: 150px;

    height: 32px;
    min-height: 32px;
    margin: 0 auto;
  }

  @media ${breakPoints.sm} {
    /* max-width: var(--width); */
    max-width: 240px;
    width: 100%;
    min-width: 150px;
    height: 40px;
    min-height: 32px;
    margin: 0 auto;
  }
`;
