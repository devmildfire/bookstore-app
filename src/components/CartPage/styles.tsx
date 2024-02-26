import breakPoints from '@/utils/breakPoints';
import styled from 'styled-components';
import Button from '@/components/Common/Button';

export const FormDiv = styled.div`
  display: flex;
  flex-direction: column;
`;

export const StyledForm = styled.form`
  display: flex;
  align-items: center;
  /* grid-template-columns: auto min-content; */
  /* grid-template-columns: auto; */

  /* column-gap: 24px;
  row-gap: 10px; */
  gap: 10px;
  margin: 0 auto;
  max-width: 879px;

  @media ${breakPoints.lg} {
    /* grid-template-columns: auto min-content;
    column-gap: 12px;
    row-gap: 5px; */
    max-width: 612px;
  }

  @media ${breakPoints.md} {
    /* grid-template-columns: auto min-content;
    column-gap: 12px;
    row-gap: 5px; */
    max-width: 400px;
  }

  @media ${breakPoints.smd} {
    /* grid-template-columns: auto fit-content();
    column-gap: 12px;
    row-gap: 5px; */
    max-width: 400px;
  }

  @media ${breakPoints.sm} {
    flex-direction: column;

    /* grid-template-columns: 1fr; */
    gap: 4px;
    /* row-gap: 16px; */
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
    width: 150px;
    max-width: var(--width);
    min-width: 150px;
    height: 40px;
    min-height: 32px;
    margin: 0 auto;
  }
`;
