// import Link from 'next/link';
import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';

const ContentDiv = styled.div`
  /* * {
    outline: 1px solid red;
  } */

  grid-area: content;

  z-index: 2;

  display: flex;
  flex-direction: column;
  gap: 60px;

  /* padding-top: 96px; */
  /* padding-right: 3vw; */
  /* padding-bottom: 130px; */

  @media screen and (max-width: 1600px) {
    /* padding-top: 96px; */
    /* padding-right: 3vw; */
    /* padding-bottom: 110px; */
    gap: 50px;
  }

  @media ${breakPoints.xl} {
    /* padding-top: 96px; */
    /* padding-right: 3vw; */
    padding-bottom: 110px;
  }

  @media screen and (max-width: 1200px) {
    /* padding-top: 75px; */
    /* padding-right: 3vw; */
    padding-bottom: 110px;
  }

  @media ${breakPoints.lg} {
    /* padding-top: 75px; */
    /* padding-right: 3vw; */
    /* padding-bottom: 110px; */
  }

  @media ${breakPoints.md} {
    /* padding-top: 34px; */
    /* padding-right: 0vw; */
    /* padding-bottom: 50px; */

    /* gap: 16px; */
  }

  @media ${breakPoints.smd} {
  }

  @media ${breakPoints.sm} {
  }
`;

const TextDiv = styled.div`
  display: flex;
  flex-direction: column;
  gap: 35px;

  /* @media ${breakPoints.xl} {
    gap: 50px;
  }

  @media ${breakPoints.lg} {
    gap: 30px;
  }

  @media ${breakPoints.md} {
  }

  @media ${breakPoints.smd} {
    gap: 25px;
  }

  @media ${breakPoints.sm} {
  } */
`;

const IconsDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  gap: 65px;

  @media screen and (max-width: 1600px) {
    gap: 30px;
  }

  @media ${breakPoints.xl} {
    gap: 30px;
  }

  @media ${breakPoints.lg} {
  }

  @media ${breakPoints.md} {
    /* flex-direction: column; */
    gap: 33px;
  }

  @media ${breakPoints.smd} {
  }

  @media ${breakPoints.sm} {
  }
`;

const Icon = styled.svg`
  color: var(--main-white-100);
  transition: all 0.3s ease-in-out;
  flex-shrink: 0;

  /* :hover {
    color: var(--main-red-100);
  } */

  --size: 85px;

  height: var(--size);
  width: var(--size);

  @media ${breakPoints.xl} {
  }

  @media screen and (max-width: 1200px) {
    --size: 60px;
  }

  @media ${breakPoints.lg} {
    --size: 60px;
  }

  @media ${breakPoints.md} {
  }

  @media ${breakPoints.smd} {
  }

  @media ${breakPoints.sm} {
  }
`;

const OneIconDiv = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  /* justify-content: space-between; */

  gap: 50px;

  @media screen and (max-width: 1600px) {
    gap: 33px;
  }

  @media ${breakPoints.xl} {
    gap: 33px;
  }

  @media ${breakPoints.lg} {
    gap: 30px;
  }

  @media ${breakPoints.md} {
    flex-direction: column;
    text-align: center;
    /* gap: 33px; */
  }

  @media ${breakPoints.smd} {
  }

  @media ${breakPoints.sm} {
  }
`;

export { TextDiv, ContentDiv, IconsDiv, Icon, OneIconDiv };
