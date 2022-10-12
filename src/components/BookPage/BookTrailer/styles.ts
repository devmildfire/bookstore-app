import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';

export const StyleWrapper = styled.section`
  margin-bottom: 130px;

  @media ${breakPoints.lg} {
    margin-bottom: 100px;
  }

  @media ${breakPoints.sm} {
    margin-bottom: 70px;
  }
`;

export const Title = styled.h2`
  margin-bottom: 85px;
  text-align: center;
  font-family: Cheque;
  font-weight: 900;
  font-size: 57px;
  line-height: 68px;

  @media ${breakPoints.xl} {
    margin-bottom: 26px;
  }

  @media ${breakPoints.lg} {
    margin-bottom: 30px;
    font-size: 40px;
    line-height: 48px;
  }

  @media ${breakPoints.sm} {
    font-size: 24px;
    line-height: 28px;
  }
`;

export const TrailerContainer = styled.div`
  position: relative;
  width: 100%;
  padding-top: 56.25%;
`;

export const TrailerVideo = styled.iframe`
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
`;
