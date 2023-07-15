import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import Button from '@/components/Common/Button';

export const StyledForm = styled.form`
  a {
    grid-column: 1 / 4;
    display: flex;
    justify-content: center;
    align-items: center;
    button {
      max-width: 900px;
      @media ${breakPoints.xl} {
        max-width: 720px;
      }

      @media ${breakPoints.lg} {
        max-width: 570px;
        height: 45px;
        min-height: 45px;
        width: 185px;
        min-width: 185px;
      }

      @media ${breakPoints.md} {
        width: 100%;
      }

      @media ${breakPoints.smd} {
        max-width: 150px;
        height: 32px;
        min-height: 32px;
        width: 150px;
        min-width: 150px;
        margin: 0 auto;
      }
    }
  }

  display: grid;
  width: 550px;
  grid-template-columns: minmax(220px, 300px) min-content;
  gap: 6px 24px;
  margin: 0 auto;

  @media ${breakPoints.lg} {
    grid-template-columns: minmax(185px, 300px) min-content;
    gap: 6px 13px;
    width: 383px;
  }

  @media ${breakPoints.md} {
    grid-template-columns: minmax(150px, 300px) min-content;
    gap: 6px 13px;
    width: 383px;
  }

  @media ${breakPoints.smd} {
    grid-template-columns: minmax(150px, 300px) min-content;
    gap: 6px 12px;
    width: 312px;
  }

  @media ${breakPoints.sm} {
    grid-template-columns: auto;
    gap: 16px 12px;
    width: 285px;
  }
`;

export const StyledButton = styled(Button)<{ className?: string }>`
  max-width: 900px;
  @media ${breakPoints.xl} {
    max-width: 720px;
  }

  @media ${breakPoints.lg} {
    max-width: 570px;
    height: 45px;
    min-height: 45px;
    width: 185px;
    min-width: 185px;
  }

  @media ${breakPoints.md} {
    width: 100%;
  }

  @media ${breakPoints.smd} {
    max-width: 150px;
    height: 32px;
    min-height: 32px;
    width: 150px;
    min-width: 150px;
    margin: 0 auto;
  }
`;
