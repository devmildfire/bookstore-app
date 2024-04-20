import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import Text from '@/components/Common/Text';

export const StyledWrapper = styled.section`
  position: relative;
  gap: 0px;
  width: 100%;
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
  position: absolute;

  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  max-width: 1060px;

  padding: 40px 50px;
  gap: 1vw 0;

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

  > div {
    display: flex;
    flex-direction: column;
  }

  > a {
    width: max-content;
    align-self: center;
    justify-self: center;
  }

  @media ${breakPoints.xxl} {
    padding: 40px 54px;
  }

  @media ${breakPoints.xl} {
    gap: 1.5vw 0;
    padding: 40px 54px;
  }

  @media ${breakPoints.lg} {
    padding: 25px 25px;
    gap: 1.5vw 0;
  }

  @media ${breakPoints.md} {
    gap: 1.5vw 0;
  }

  @media ${breakPoints.smd} {
    padding: 25px 25px;
    gap: 2vw 0;
  }

  @media ${breakPoints.sm} {
    gap: 2.5vw 0;
  }
`;

export const StyledMainText = styled(Text)`
  max-width: 100%;
  margin: 0 auto;
  /* max-width: calc(0.7 * var(--box-width)); */
  font-size: 18px;

  @media ${breakPoints.xxl} {
    font-size: 16px;
    /* max-width: calc(0.77 * var(--box-width)); */
  }

  @media ${breakPoints.lg} {
    /* max-width: calc(0.66 * var(--box-width)); */
    font-size: 14px;
  }

  @media ${breakPoints.md} {
  }

  @media ${breakPoints.smd} {
    /* max-width: calc(0.9 * var(--box-width)); */
    font-size: 14px;
  }

  @media ${breakPoints.sm} {
    font-size: 12px;
    line-height: 142%;
    /* text-align: left; */
    letter-spacing: 0em;
  }
`;

export const StyledSecondaryText = styled(Text)`
  margin: 0 auto;
  /* max-width: calc(0.43 * var(--box-width)); */
  font-size: 18px;

  /* width: var(--width); */

  @media ${breakPoints.xxl} {
    font-size: 16px;
    /* max-width: calc(0.62 * var(--box-width)); */
  }

  @media ${breakPoints.lg} {
    /* max-width: calc(0.7 * var(--box-width)); */
    font-size: 14px;
  }

  @media ${breakPoints.md} {
    /* text-align: center; */
  }

  @media ${breakPoints.smd} {
    /* max-width: calc(0.9 * var(--box-width)); */
    font-size: 14px;
  }

  @media ${breakPoints.sm} {
    font-size: 12px;
    line-height: 142%;
    /* text-align: left; */
    letter-spacing: 0em;
  }
`;
