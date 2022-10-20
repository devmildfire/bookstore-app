import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import Text from '@/components/Common/Text';

export const StyledWrapper = styled.section`
  display: grid;
  gap: 48px;
  justify-content: center;

  /* padding: 44px 79px 40px 132px; */
  /* border: 1px solid var(--main-red-100); */

  @media ${breakPoints.xl} {
    gap: 35px;

    /* padding: 44px 24px 40px 60px; */
  }

  @media ${breakPoints.lg} {
    gap: 27px;

    /* padding: 33px 19px 40px 30px; */
  }

  @media ${breakPoints.sm} {
    gap: 20px;

    /* padding: 18px 19px 13px; */
  }
`;

export const StyledHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media ${breakPoints.xl} {
    max-width: 777px;
    flex-wrap: wrap;
  }

  @media ${breakPoints.lg} {
    max-width: 671px;
  }

  @media ${breakPoints.sm} {
    max-width: 243px;
  }
`;

export const StyledHeaderText = styled(Text)`
  font-weight: 700;
  font-size: 40px;

  @media ${breakPoints.lg} {
    font-size: 30px;
  }

  @media ${breakPoints.sm} {
    font-size: 20px;
  }
`;

export const StyledDate = styled(Text)`
  font-weight: 700;

  @media ${breakPoints.xl} {
    width: 100%;
  }

  @media ${breakPoints.sm} {
    width: auto;

    font-weight: 400;
  }
`;

export const StyledBody = styled.main`
  display: flex;

  gap: 100px;

  @media ${breakPoints.xl} {
    gap: 44px;
  }

  @media ${breakPoints.lg} {
    gap: 35px;
  }

  @media ${breakPoints.md} {
    gap: 20px;
  }

  @media ${breakPoints.sm} {
    flex-direction: column;

    gap: 12px;
  }
`;

export const StyledButtons = styled.div`
  display: grid;
  gap: 10px;

  @media ${breakPoints.sm} {
    order: 1;
  }
`;

export const StyledProperties = styled.dl`
  width: 100%;

  @media ${breakPoints.xl} {
    display: flex;
    flex-direction: column;
  }
`;

export const StyledTerm = styled.dt``;

export const StyledDescription = styled.dd``;

export const StyledItem = styled.div`
  display: flex;
  justify-content: flex-start;

  &:last-child {
    @media ${breakPoints.xl} {
      order: -1;
    }
  }
`;

export const StyledReadersList = styled.ul`
  display: flex;
  gap: 8px;
  @media ${breakPoints.xl} {
    flex-wrap: wrap;
  }

  @media ${breakPoints.md} {
    flex-direction: column;
  }
`;

export const StyledReadersItem = styled.li``;
