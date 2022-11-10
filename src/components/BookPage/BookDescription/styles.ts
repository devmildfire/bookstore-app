import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import colors from '@/utils/colors';
import Text from '@/components/Common/Text';

export const StyledWrapper = styled.section`
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 50px;
  @media ${breakPoints.sm} {
    justify-items: center;
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

export const StyledImage = styled.img`
  padding-top: 10px;
  width: 500px;
  height: 750px;

  @media ${breakPoints.xl} {
    width: 485px;
    height: 740px;
  }

  @media ${breakPoints.lg} {
    width: 312px;
    height: 480px;
  }

  @media ${breakPoints.md} {
    width: 100%;
    max-width: 256px;
    height: auto;
  }

  @media ${breakPoints.sm} {
    max-width: 512px;
  }
`;

export const DescriptionLayout = styled.div`
  display: grid;
  gap: 16px;
  grid-template-rows: repeat(6, min-content);
  padding: 0 20px;
`;

export const StyledTitle = styled(Text)`
  line-height: 1;
  color: ${colors.gray5};

  @media screen and (max-width: 576px) {
    font-size: 24px;
  }
  /* 
  @media ${breakPoints.xl} {
    margin-bottom: 10px;
  }

  @media ${breakPoints.lg} {
    margin-bottom: 10px;
  }

  @media ${breakPoints.md} {
    margin-bottom: 10px;
  } */
`;

export const StyledAuthor = styled(Text)`
  @media screen and (max-width: 576px) {
    font-size: 16px;
  }
  /* margin-bottom: 10px;
  @media ${breakPoints.sm} {
    margin-bottom: 5px;
  } */
`;

export const StyledInfo = styled(Text)`
  /* margin-bottom: 129px; */
  font-size: 14px;
  @media screen and (max-width: 576px) {
    font-size: 10px;
  }
  /* 
  @media ${breakPoints.xl} {
    margin-bottom: 45px;
  }

  @media ${breakPoints.md} {
    margin-bottom: 25px;
  }

  @media ${breakPoints.sm} {
    text-align: center;
    margin-bottom: 30px;
  } */
`;

export const StyledThesis = styled(Text)`
  /* margin-bottom: 95px; */
  font-style: italic;
  font-size: 28px;
  line-height: 1.4;
  letter-spacing: 0;
  max-width: 760px;
  /* 
  @media ${breakPoints.xl} {
    margin-bottom: 23px;
  }

  @media ${breakPoints.lg} {
    margin-bottom: 17px;
  } */

  @media screen and (max-width: 576px) {
    font-size: 16px;
  }
`;

export const StyledDescription = styled.div`
  display: grid;
  gap: 20px;
  max-width: 700px;

  @media ${breakPoints.xl} {
    max-width: 500px;
    gap: 10px;
  }
`;
