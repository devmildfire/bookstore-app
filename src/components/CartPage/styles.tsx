import breakPoints from '@/utils/breakPoints';
import styled from 'styled-components';
import Button from '@/components/Common/Button';
import Input from '../Common/Input';

export const FormDiv = styled.div`
  display: flex;
  flex-direction: row;
  gap: 120px;
`;

export const ButtonDiv = styled.div`
  display: flex;
  /* flex-direction: column; */
  justify-content: right;
`;

export const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  /* grid-template-columns: auto min-content; */
  /* grid-template-columns: auto; */

  /* column-gap: 24px;
  row-gap: 10px; */
  gap: 10px;
  margin: 0 auto;
  /* max-width: 879px; */

  /* outline: 1px solid green;

  * {
    outline: 1px solid green;
  } */

  @media ${breakPoints.lg} {
    /* grid-template-columns: auto min-content;
    column-gap: 12px;
    row-gap: 5px; */
    /* max-width: 612px; */
  }

  @media ${breakPoints.md} {
    /* grid-template-columns: auto min-content;
    column-gap: 12px;
    row-gap: 5px; */
    /* max-width: 400px; */
  }

  @media ${breakPoints.smd} {
    /* grid-template-columns: auto fit-content();
    column-gap: 12px;
    row-gap: 5px; */
    /* max-width: 400px; */
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
export const FormColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 38px;
  width: 640px;
`;

export const StyledInput = styled.input`
  background-color: var(--main-white-20);
  border: none;
  color: var(--main-white-100);
  padding: 20px;
  max-width: var(--width);
  margin: 0 auto;
  /* width: 640px; */
  width: 100%;

  font-size: 20px;

  @media ${breakPoints.lg} {
    width: 100%;
    height: 45px;
    max-width: 415px;
    padding: 0px 6px;
    /* padding: 0px 0px; */
    margin: 0 auto;
    font-size: 14px;
  }

  @media ${breakPoints.smd} {
    width: 100%;
    height: 32px;
    max-width: 239px;
    padding: 0px 6px;
    margin: 0 auto;
    font-size: 10px;
  }

  @media ${breakPoints.sm} {
    width: 150px;
    height: 32px;
    max-width: var(--width);
    padding: 0px 6px;
    margin: 0 auto;
    font-size: 10px;
  }
`;
