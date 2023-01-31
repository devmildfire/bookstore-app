import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import Text from '@/components/Common/Text';
import PaddedText from '@/components/Common/PaddedText';
import RDImage from '@/assets/images/dino_figma.png';
import litMagazineBack from '@/assets/images/litMagazineBack.png';
import gradientBottom from '@/assets/images/gradient.png';
import gradientTop from '@/assets/images/gradient_top_grey.png';

export const StyledWrapper = styled.section`
  /* display: grid; */
  display: flex;
  flex-direction: column;
  gap: 0px;
  /* max-width: 1440px; */
  width: 100%;
  aspect-ratio: 48/27; // соотношение сторон 1920 к 1080
  /* 1919/562 */
  /* background-image: url(${litMagazineBack.src}), url(${gradientBottom.src}); */
  /* background-image: linear-gradient(
      180deg,
      #121212 34.18%,
      rgba(18, 18, 18, 0.83) 54.72%,
      rgba(18, 18, 18, 0.345207) 77.1%,
      rgba(18, 18, 18, 0) 93.04%
    ),
    url(${gradientBottom.src}), url(${litMagazineBack.src}); */

  background-image: url(${litMagazineBack.src});

  /* background-image: url(${gradientTop.src}), url(${gradientBottom.src}),
    url(${litMagazineBack.src}); */

  /* background-image: url(${gradientBottom.src}); */
  /* background-size: cover contain; */
  /* background-size: 100% 20%, 100% 50%, 100%;
  background-position: top, bottom, left center;
  background-repeat: no-repeat, no-repeat, repeat;
  background-attachment: local, local, fixed; */

  background-size: 100%;
  background-position: left center;
  background-repeat: repeat;
  background-attachment: fixed;

  padding-top: 150px;

  @media ${breakPoints.xl} {
    padding-top: 100px;
  }

  @media ${breakPoints.lg} {
    padding-top: 50px;
  }

  @media ${breakPoints.md} {
    padding-top: 10px;
  }

  @media ${breakPoints.sm} {
    /* gap: 25px; */
    aspect-ratio: auto;
    background-size: 100% 20%, 100% 50%, auto 35%;
  }
`;

export const StyledContent = styled.div`
  margin-top: 50px;
  margin-left: auto;
  margin-right: auto;

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

  @media ${breakPoints.xl} {
    gap: 15px;
    height: calc(440px + var(--RDOffset));
    margin-top: 40px;

    padding-top: 0;
    padding-left: 0px;
    padding-right: 0px;
  }

  @media ${breakPoints.lg} {
    margin-top: 30px;
    gap: 30px;
    height: 345px;
    padding-left: 0px;
    padding-right: 0px;
  }

  @media ${breakPoints.md} {
    margin-top: 25px;
    gap: 18px;
    /* height: 420px; */
    height: 195px;
    padding-left: 0px;
    padding-right: 0px;
  }

  @media ${breakPoints.sm} {
    margin-top: 15px;
    grid-template-rows: repeat(3, min-content);
    gap: 15px;
    height: 290px;

    /* height: min-content; */
    padding-left: 17px;
    padding-right: 17px;
  }
`;

export const StyledContentHeading = styled.div`
  position: relative;
  z-index: 0;

  display: grid;
  /* grid-template-rows: repeat(2, min-content) 1fr; */
  gap: 0px;

  height: min-content;
  /* margin-top: 150px; */
  margin-left: auto;
  margin-right: auto;
  max-width: 1440px;
  /* width: 100%; */
  width: var(--width);
  justify-self: center;

  /* padding-top: 78px; */

  @media ${breakPoints.xl} {
    /* margin-top: 100px; */
    padding-top: 0;
    padding-left: 0px;
    padding-right: 0px;
  }

  @media ${breakPoints.lg} {
    /* margin-top: 50px; */
    padding-left: 0px;
    padding-right: 0px;
  }

  @media ${breakPoints.md} {
    /* margin-top: 10px; */
    padding-left: 0px;
    padding-right: 0px;
  }

  @media ${breakPoints.sm} {
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
    --width: 500px;
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
