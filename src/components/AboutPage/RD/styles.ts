import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import Text from '@/components/Common/Text';
import PaddedText from '@/components/Common/PaddedText';
import RDImage from '@/assets/images/dino.png';

export const StyledWrapper = styled.section`
  display: grid;
  gap: 50px;
  max-width: 1440px;
  width: 100%;
`;

export const StyledContent = styled.div`
  --RDOffset: 40px;

  position: relative;
  z-index: 0;

  display: grid;
  grid-template-rows: repeat(2, min-content) 1fr;
  gap: 40px;

  height: 529px;
  max-width: 1440px;
  width: 100%;

  > :last-child {
    align-self: end;

    width: max-content;
  }

  padding-top: 78px;

  @media ${breakPoints.xl} {
    gap: 20px;
    height: calc(618px + var(--RDOffset));

    padding-top: 0;

    /* --RDOffset: 118px; */
    --RDOffset: 0px;
    padding-left: 80px;
    padding-right: 80px;
  }

  @media ${breakPoints.lg} {
    gap: 30px;
    height: 521px;

    --RDOffset: 0px;
    padding-left: 40px;
    padding-right: 40px;
  }

  @media ${breakPoints.md} {
    gap: 18px;
    height: 420px;
    padding-left: 30px;
    padding-right: 30px;
  }

  @media ${breakPoints.sm} {
    grid-template-rows: repeat(3, min-content);
    gap: 15px;

    height: min-content;
  }
`;

export const StyledRD = styled.div`
  position: absolute;
  inset: 0;
  z-index: -1;

  background-image: url(${RDImage.src});
  background-repeat: no-repeat;
  background-position: calc(100% + 130px) calc(50% + var(--RDOffset));
  background-size: 60%;

  @media ${breakPoints.sm} {
    background: none;
  }
`;

export const StyledMainText = styled(Text)`
  --width: 720px;

  width: var(--width);

  @media ${breakPoints.xl} {
    --width: 640px;
  }

  @media ${breakPoints.lg} {
    --width: 450px;
  }

  @media ${breakPoints.md} {
    --width: 350px;
  }

  @media ${breakPoints.sm} {
    --width: 100%;
  }
`;

export const StyledMainPaddedText = styled(PaddedText)`
  --width: 720px;

  width: var(--width);

  @media ${breakPoints.xl} {
    --width: 640px;
  }

  @media ${breakPoints.lg} {
    --width: 450px;
  }

  @media ${breakPoints.md} {
    --width: 350px;
  }

  @media ${breakPoints.sm} {
    --width: 100%;
  }
`;

export const StyledSecondaryPaddedText = styled(StyledMainText)`
  width: calc(var(--width) - 10%);

  @media ${breakPoints.sm} {
    width: 100%;
  }
`;

export const StyledSecondaryText = styled(StyledMainPaddedText)`
  width: calc(var(--width) - 10%);

  @media ${breakPoints.sm} {
    width: 100%;
  }
`;
