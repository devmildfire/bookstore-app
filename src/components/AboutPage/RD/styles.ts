import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import Text from '@/components/Common/Text';
import PaddedText from '@/components/Common/PaddedText';
import RDImage from '@/assets/images/dino_figma.png';

export const StyledWrapper = styled.section`
  display: grid;
  gap: 0px;
  max-width: 1440px;
  width: 100%;

  @media ${breakPoints.xl} {
    gap: 60px;
  }

  @media ${breakPoints.lg} {
    gap: 50px;
  }

  @media ${breakPoints.md} {
    gap: 30px;
  }

  @media ${breakPoints.sm} {
    gap: 25px;
  }
`;

export const StyledContent = styled.div`
  --RDOffset: 40px;

  position: relative;
  z-index: 0;

  display: grid;
  grid-template-rows: repeat(2, min-content) 1fr;
  gap: 15px;

  height: 390px;
  max-width: 1440px;
  /* width: 100%; */
  width: var(--width);
  justify-self: center;

  > :last-child {
    align-self: end;

    width: max-content;
  }

  padding-top: 78px;

  @media ${breakPoints.xl} {
    gap: 15px;
    height: calc(440px + var(--RDOffset));

    padding-top: 0;

    /* --RDOffset: 118px; */
    --RDOffset: 0px;
    padding-left: 0px;
    padding-right: 0px;
  }

  @media ${breakPoints.lg} {
    gap: 30px;
    height: 345px;

    --RDOffset: -20px;
    padding-left: 0px;
    padding-right: 0px;
  }

  @media ${breakPoints.md} {
    gap: 18px;
    /* height: 420px; */
    height: 195px;
    padding-left: 0px;
    padding-right: 0px;
  }

  @media ${breakPoints.sm} {
    grid-template-rows: repeat(3, min-content);
    gap: 15px;
    height: 290px;

    /* height: min-content; */
    padding-left: 17px;
    padding-right: 17px;
  }
`;

export const StyledRD = styled.div`
  position: absolute;
  inset: 0;
  z-index: -1;

  background-image: url(${RDImage.src});
  background-repeat: no-repeat;
  background-position: calc(100% - 30px) calc(0% + var(--RDOffset));
  background-size: 30%;

  @media ${breakPoints.xl} {
    background-size: calc(411px + 100vw * 0.08263);
    background-position: calc(100% + 90px) calc(0% + var(--RDOffset));
  }

  @media ${breakPoints.lg} {
    background-size: calc(174px + 100vw * 0.23144);
    background-position: calc(100% + 30px) calc(0% + var(--RDOffset));
  }

  @media ${breakPoints.md} {
    background-size: calc(174px + 100vw * 0.1);
    background-position: calc(100% + 30px) calc(20% + var(--RDOffset));
  }

  @media ${breakPoints.sm} {
    background-size: 174px;
    background-position: calc(100% + 30px) calc(70% + var(--RDOffset));
  }
`;

export const StyledMainText = styled(Text)`
  --width: 764px;
  font-size: 20px;

  width: var(--width);

  @media ${breakPoints.xl} {
    --width: 640px;
  }

  @media ${breakPoints.lg} {
    --width: 500px;
    font-size: 16px;
  }

  @media ${breakPoints.md} {
    --width: 385px;
  }

  @media ${breakPoints.smd} {
    font-size: 14px;
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

export const StyledSecondaryText = styled(Text)`
  /* width: calc(var(--width) - 10%); */

  --width: 578px;
  font-size: 20px;

  width: var(--width);

  @media ${breakPoints.xl} {
    --width: 640px;
  }

  @media ${breakPoints.lg} {
    --width: 400px;
    font-size: 16px;
  }

  @media ${breakPoints.md} {
    --width: 350px;
  }

  @media ${breakPoints.smd} {
    font-size: 14px;
  }

  @media ${breakPoints.sm} {
    width: 55%;
  }
`;
