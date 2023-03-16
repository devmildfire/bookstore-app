import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import Text from '@/components/Common/Text';
import PaddedText from '@/components/Common/PaddedText';
import RDImage from '@/assets/images/dino_figma.png';

export const StyledWrapper = styled.section`
  position: relative;
  gap: 0px;
  width: 100vw;
  aspect-ratio: 1920/1277;
  overflow: hidden;

  h1 {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translateX(-50%);
    font-size: 10vw;
    z-index: 1000;
  }

  > img {
    object-fit: cover;
    height: 100%;
    z-index: 10;
    will-change: transform;
  }

  @media ${breakPoints.xxl} {
    height: calc(61.61vw + 94.9px);
  }

  @media ${breakPoints.xl} {
    height: calc(61.16vw + 87.71429px);
  }

  @media ${breakPoints.lg} {
    height: calc(40vw + 304.4px);
  }

  @media ${breakPoints.md} {
  }

  @media ${breakPoints.smd} {
    height: calc(-4.669vw + 949.43px);
  }

  @media ${breakPoints.sm} {
  }
`;

export const StyledContent = styled.div`
  --box-height: 603px;
  --box-width: 1058px;
  position: absolute;

  min-height: var(--box-height);
  width: var(--box-width);
  top: calc(50% - var(--box-height) / 2);
  left: calc(50% - var(--box-width) / 2);
  padding: 40px 0;

  background: linear-gradient(
    113.04deg,
    rgba(18, 18, 18, 0.6) 0%,
    rgba(0, 0, 0, 0.6) 98.54%
  );

  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);

  border-radius: 4px;

  z-index: 50;

  display: grid;
  align-items: center;
  justify-content: center;

  @media ${breakPoints.xxl} {
    --box-height: calc(18.52678571vw + 247.2857143px);
    --box-width: calc(47.43304vw + 147.2857px);
  }

  @media ${breakPoints.xl} {
  }

  @media ${breakPoints.lg} {
    --box-width: calc(46.42857vw + 157.5714px);
    --box-height: calc(29.28571429vw + 137.1142857px);
    padding: 20px 0;
  }

  @media ${breakPoints.md} {
    gap: 10px 0;
  }

  @media ${breakPoints.smd} {
    --box-width: calc(62.26415vw + 39.75px);
    --box-height: calc(-5.188679245vw + 393.6037736px);
    padding: 10px 12px;
    gap: 10px 0;
  }

  @media ${breakPoints.sm} {
    gap: 10px 0;
  }
`;

export const StyledContentHeading = styled.div`
  position: relative;
  z-index: 0;

  display: grid;
  gap: 0px;

  height: min-content;

  margin-left: auto;
  margin-right: auto;
  max-width: 1440px;
  justify-self: center;

  @media ${breakPoints.xl} {
    padding-top: 0;
    padding-left: 0px;
    padding-right: 0px;
  }

  @media ${breakPoints.lg} {
    padding-left: 0px;
    padding-right: 0px;
  }

  @media ${breakPoints.md} {
    padding-left: 0px;
    padding-right: 0px;
  }

  @media ${breakPoints.sm} {
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
  margin: 0 auto;
  max-width: calc(0.7 * var(--box-width));
  font-size: 18px;

  @media ${breakPoints.xxl} {
    font-size: 16px;
    max-width: calc(0.77 * var(--box-width));
  }

  @media ${breakPoints.lg} {
    max-width: calc(0.66 * var(--box-width));
    font-size: 14px;
  }

  @media ${breakPoints.md} {
  }

  @media ${breakPoints.smd} {
    max-width: calc(0.9 * var(--box-width));
    font-size: 14px;
  }

  @media ${breakPoints.sm} {
    font-size: 12px;
    line-height: 142%;
    text-align: left;
    letter-spacing: 0em;
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
  margin: 0 auto;
  max-width: calc(0.43 * var(--box-width));
  font-size: 18px;

  width: var(--width);

  @media ${breakPoints.xxl} {
    font-size: 16px;
    max-width: calc(0.62 * var(--box-width));
  }

  @media ${breakPoints.lg} {
    max-width: calc(0.7 * var(--box-width));
    font-size: 14px;
  }

  @media ${breakPoints.md} {
    text-align: center;
  }

  @media ${breakPoints.smd} {
    max-width: calc(0.9 * var(--box-width));
    font-size: 14px;
  }

  @media ${breakPoints.sm} {
    font-size: 12px;
    line-height: 142%;
    text-align: left;
    letter-spacing: 0em;
  }
`;
