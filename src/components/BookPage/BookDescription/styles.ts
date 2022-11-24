import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import colors from '@/utils/colors';
import Text from '@/components/Common/Text';

export const StyledWrapper = styled.section`
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 50px;

  @media ${breakPoints.lg} {
    gap: 20px;
  }

  @media ${breakPoints.sm} {
    justify-items: center;
    grid-template-columns: 1fr;
  }
`;

export const StyledImage = styled.img`
  padding-top: 10px;
  width: 500px;
  height: 750px;
  cursor: pointer;

  @media ${breakPoints.xl} {
    width: 485px;
    height: 740px;
  }

  @media ${breakPoints.lg} {
    width: 312px;
    height: 480px;
    padding-top: 8px;
  }

  @media ${breakPoints.md} {
    width: 100%;
  }

  @media ${breakPoints.sm} {
    padding-top: 0;
    height: auto;
  }
`;

export const DescriptionLayout = styled.div`
  display: grid;
  gap: 16px;
  grid-template-rows: repeat(6, min-content);

  @media ${breakPoints.sm} {
    padding: 0 20px;
  } ;
`;

export const StyledTitle = styled(Text)`
  line-height: 1;
  color: ${colors.gray5};

  @media ${breakPoints.lg} {
    font-size: 42px;
  }

  @media screen and (max-width: 576px) {
    font-size: 24px;
  }
`;

export const StyledAuthor = styled(Text)`
  @media ${breakPoints.lg} {
    font-size: 24px;
  }

  @media screen and (max-width: 576px) {
    font-size: 16px;
  }
`;

export const StyledInfo = styled(Text)`
  font-size: 14px;
  @media screen and (max-width: 576px) {
    font-size: 10px;
  }
`;

export const StyledThesis = styled(Text)`
  font-style: italic;
  font-size: 28px;
  line-height: 1.4;
  letter-spacing: 0;
  max-width: 760px;

  @media ${breakPoints.lg} {
    font-size: 18px;
  }

  @media screen and (max-width: 576px) {
    font-size: 16px;
  }
`;

export const StyledDescription = styled.div`
  display: grid;
  gap: 20px;

  @media ${breakPoints.xl} {
    gap: 10px;
  }
`;

export const CoverPopup = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 99999;
  background-color: #000000d6;
  opacity: 0;
  visibility: hidden;
  transition: 0.3s;
  &.active {
    opacity: 1;
    visibility: visible;
  }
`;

export const FullscreenCover = styled.img`
  width: auto;
  height: 100%;
  opacity: 0;
  transition: 0.3s;
  &.active {
    opacity: 1;
  }
  @media ${breakPoints.md} {
    height: auto;
    width: 85%;
  }
`;
