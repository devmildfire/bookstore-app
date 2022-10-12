import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import colors from '@/utils/colors';
import Text from '@/components/Common/Text';

export const StyledWrapper = styled.section`
  display: grid;
  grid-template-columns: repeat(2, auto);
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
    width: 260px;
    height: 365px;
  }
`;

export const DescriptionLayout = styled.div`
  display: grid;
  gap: 25px;
  grid-template-rows: repeat(6, min-content);
`;

export const StyledTitle = styled(Text)`
  line-height: 1;
  color: ${colors.gray5};
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
  /* margin-bottom: 10px;

  @media ${breakPoints.sm} {
    margin-bottom: 5px;
  } */
`;

export const StyledInfo = styled(Text)`
  /* margin-bottom: 129px; */
  font-size: 14px;
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
  /* 
  @media ${breakPoints.xl} {
    margin-bottom: 23px;
  }

  @media ${breakPoints.lg} {
    margin-bottom: 17px;
  } */
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
