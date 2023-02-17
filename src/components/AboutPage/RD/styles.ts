import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import Text from '@/components/Common/Text';
import PaddedText from '@/components/Common/PaddedText';
import RDImage from '@/assets/images/dino_figma.png';
import litMagazineBack from '@/assets/images/litMagazineBack.png';
import gradientBottom from '@/assets/images/gradient.png';
import gradientTop from '@/assets/images/gradient_top_grey.png';

export const StyledWrapper = styled.section`
  * {
    outline: 1px solid green;
  }
  outline: 1px solid green;
  /* display: grid; */
  /* display: flex; */

  position: relative;
  /* justify-content: center;
  align-items: center;
  flex-direction: column; */
  gap: 0px;
  /* max-width: 1440px; */
  width: 100vw;
  aspect-ratio: 1920/1277;
  /* height: 500px; */
  overflow: hidden;

  h1 {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translateX(-50%);
    font-size: 10vw;
    /* width: fit-content; */
    z-index: 1000;
  }

  > img {
    object-fit: cover;
    height: 100%;
    z-index: 10;
  }

  /* aspect-ratio: 48/27;  */
  // соотношение сторон 1920 к 1080
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

  /* background-image: url(${litMagazineBack.src}); */

  /* background-image: url(${gradientTop.src}), url(${gradientBottom.src}),
    url(${litMagazineBack.src}); */

  /* background-image: url(${gradientBottom.src}); */
  /* background-size: cover contain; */
  /* background-size: 100% 20%, 100% 50%, 100%;
  background-position: top, bottom, left center;
  background-repeat: no-repeat, no-repeat, repeat;
  background-attachment: local, local, fixed; */

  /* background-size: 100%;
  background-position: left center;
  background-repeat: repeat;
  background-attachment: fixed; */

  /* padding-top: 150px; */

  @media ${breakPoints.xxl} {
    height: calc(61.61vw + 94.9px);
    > img {
      /* height: 1250px; */
    }
  }

  @media ${breakPoints.xl} {
    height: calc(61.16vw + 87.71429px);
    > img {
      /* height: 1250px; */
    }
  }

  @media ${breakPoints.lg} {
    height: calc(40vw + 304.4px);
    > img {
      /* height: 1050px; */
    }
  }

  @media ${breakPoints.md} {
    > img {
      /* height: 825px; */
    }
  }

  @media ${breakPoints.smd} {
    height: calc(20.28vw + 451.0943px);
    > img {
      /* height: 825px; */
    }
  }

  @media ${breakPoints.sm} {
    > img {
      /* height: 825px; */
    }
  }
`;

export const StyledContent = styled.div`
  /* --box-height: calc(18.52678571vw + 247.2857143px);
  --box-width: calc(47.43304vw + 147.2857px); */
  --box-height: 603px;
  --box-width: 1058px;
  position: absolute;
  /* margin: auto auto; */
  /* aspect-ratio: 1080/684; */
  min-height: var(--box-height);
  width: var(--box-width);
  top: calc(55% - var(--box-height) / 2);
  left: calc(50% - var(--box-width) / 2);

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
    /* --box-height: calc(684 / 1080 * 100%);
    --box-width: calc(684 / 1080 * 100%); */
    /* gap: 15px;
    height: calc(440px + var(--RDOffset));
    margin-top: 40px;

    padding-top: 0;
    padding-left: 0px;
    padding-right: 0px; */
  }

  @media ${breakPoints.lg} {
    --box-width: calc(46.42857vw + 157.5714px);
    --box-height: calc(29.28571429vw + 137.1142857px);
    /* margin-top: 30px;
    gap: 30px;
    height: 345px;
    padding-left: 0px;
    padding-right: 0px; */
  }

  @media ${breakPoints.md} {
    /* margin-top: 25px;
    gap: 18px; */
    /* height: 420px; */
    /* height: 195px;
    padding-left: 0px;
    padding-right: 0px; */
  }

  @media ${breakPoints.smd} {
    --box-width: calc(62.26415vw + 39.75px);
    --box-height: calc(-5.188679245vw + 393.6037736px);
  }

  @media ${breakPoints.sm} {
    /* margin-top: 15px;
    grid-template-rows: repeat(3, min-content);
    gap: 15px;
    height: 290px; */

    /* height: min-content; */
    /* padding-left: 17px;
    padding-right: 17px; */
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
  /* width: var(--width); */
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
  margin: 0 auto;
  /* --width: 764px; */
  max-width: calc(0.7 * var(--box-width));
  font-size: 18px;

  width: var(--width);

  @media ${breakPoints.xxl} {
    font-size: 16px;
    max-width: calc(0.77 * var(--box-width));
  }

  @media ${breakPoints.lg} {
    /* --width: 500px; */
    max-width: calc(0.66 * var(--box-width));
    font-size: 14px;
  }

  @media ${breakPoints.md} {
    /* --width: 500px; */
  }

  @media ${breakPoints.smd} {
    max-width: calc(0.97 * var(--box-width));
    font-size: 14px;
  }

  @media ${breakPoints.sm} {
    max-width: calc(0.95 * var(--box-width));
    font-size: 12px;
    text-align: left;
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
  /* --width: 764px; */
  max-width: calc(0.43 * var(--box-width));
  font-size: 18px;

  width: var(--width);

  @media ${breakPoints.xxl} {
    font-size: 16px;
    max-width: calc(0.62 * var(--box-width));
  }

  @media ${breakPoints.lg} {
    /* --width: 500px; */
    max-width: calc(0.7 * var(--box-width));
    font-size: 14px;
  }

  @media ${breakPoints.md} {
    /* --width: 500px; */
  }

  @media ${breakPoints.smd} {
    max-width: calc(0.9 * var(--box-width));
    font-size: 14px;
    text-align: left;
    margin: 0 auto 0 calc(0.005 * var(--box-width));
  }

  @media ${breakPoints.sm} {
    max-width: calc(0.63 * var(--box-width));
    font-size: 12px;
    text-align: left;
    margin: 0 auto 0 calc(0.09 * var(--box-width));
  }
`;
