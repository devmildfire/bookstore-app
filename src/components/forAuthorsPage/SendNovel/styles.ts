// import Link from 'next/link';
import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';

const NovelDiv = styled.div`
  .title {
    grid-area: title;
    align-self: center;
  }

  .text {
    padding-top: 88px;
    padding-bottom: 84px;
    grid-area: text;
    align-self: center;
  }

  .picture {
    grid-area: picture;
    /* align-self: center; */
    justify-self: center;
  }

  .link {
    grid-area: link;
    align-self: center;
  }

  * {
    outline: 1px solid red;
  }

  span,
  a {
    color: var(--main-red-100);
  }

  display: grid;
  grid-template-areas:
    'title title'
    'text picture'
    'link picture';
  column-gap: 142px;
  row-gap: 0px;

  --padding-top: 100px;
  --padding-left: 95px;
  --padding-right: 60px;
  --padding-bottom: 100px;

  padding: var(--padding-top) var(--padding-right) var(--padding-bottom)
    var(--padding-left);

  @media screen and (max-width: 1600px) {
    --padding-top: 100px;
    --padding-left: 24px;
    --padding-right: 40px;
    --padding-bottom: 100px;

    column-gap: 75px;
    /* row-gap: 60px; */
  }

  @media ${breakPoints.xl} {
    --padding-top: 100px;
    --padding-left: 24px;
    --padding-right: 40px;
    --padding-bottom: 100px;

    column-gap: 75px;
    /* row-gap: 60px; */
  }

  @media screen and (max-width: 1200px) {
    grid-template-areas:
      'title title'
      'text picture'
      'link picture';

    --padding-top: 90px;
    --padding-left: 14px;
    --padding-right: 20px;
    --padding-bottom: 80px;

    column-gap: 35px;
    /* row-gap: 60px; */
  }

  @media ${breakPoints.lg} {
    /* grid-template-areas:
      'title title'
      'text picture'
      'link picture'; */

    grid-template-areas:
      'title'
      'text'
      'link'
      'picture';

    --padding-top: 90px;
    --padding-left: 14px;
    --padding-right: 20px;
    --padding-bottom: 80px;

    column-gap: 35px;
    /* row-gap: 60px; */
  }

  @media ${breakPoints.md} {
    grid-template-areas:
      'title'
      'text'
      'link'
      'picture';

    --padding-top: 90px;
    --padding-left: 31px;
    --padding-right: 29px;
    --padding-bottom: 80px;

    column-gap: 10px;
    /* row-gap: 30px; */
  }

  @media ${breakPoints.smd} {
  }

  @media ${breakPoints.sm} {
  }
`;

const TextDiv = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

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

const TextReqDiv = styled.div`
  display: flex;
  flex-direction: row;
  gap: 24px;

  @media ${breakPoints.xl} {
    gap: 24px;
  }

  @media ${breakPoints.lg} {
    gap: 16px;
  }

  @media ${breakPoints.md} {
  }

  @media ${breakPoints.smd} {
  }

  @media ${breakPoints.sm} {
  }
`;

const IconsDiv = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;

  @media ${breakPoints.xl} {
  }

  @media ${breakPoints.lg} {
  }

  @media ${breakPoints.md} {
    flex-direction: column;
    gap: 33px;
  }

  @media ${breakPoints.smd} {
  }

  @media ${breakPoints.sm} {
  }
`;

const DinoPawsBook = styled.svg`
  /* * {
    outline: none;
  }

  color: var(--main-white-100);
  transition: all 0.3s ease-in-out;

  :hover {
    color: var(--main-red-100);
  } */

  --size: 528px;

  /* height: var(--size); */
  width: var(--size);
  /* height: auto; */

  @media screen and (max-width: 1600px) {
    --size: 444px;
  }

  @media ${breakPoints.xl} {
    --size: 444px;
  }

  @media screen and (max-width: 1200px) {
    --size: 297px;
  }

  @media ${breakPoints.lg} {
    --size: 297px;
  }

  @media ${breakPoints.md} {
    /* --size: 68px; */
  }

  @media ${breakPoints.smd} {
  }

  @media ${breakPoints.sm} {
    --size: 252px;
  }
`;

const OneIconDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  gap: 32px;

  @media ${breakPoints.xl} {
    gap: 24px;
  }

  @media ${breakPoints.lg} {
  }

  @media ${breakPoints.md} {
    flex-direction: row;
    gap: 33px;
  }

  @media ${breakPoints.smd} {
  }

  @media ${breakPoints.sm} {
  }
`;

const ReqDiv = styled.div`
  display: flex;
  flex-direction: column;
  /* align-items: center; */

  gap: 16px;

  span,
  a {
    color: var(--main-red-100);
  }

  @media ${breakPoints.xl} {
    gap: 24px;
  }

  @media ${breakPoints.lg} {
    gap: 27px;
  }

  @media ${breakPoints.md} {
    gap: 16px;
  }

  @media ${breakPoints.smd} {
  }

  @media ${breakPoints.sm} {
  }
`;

export {
  TextDiv,
  NovelDiv,
  IconsDiv,
  DinoPawsBook,
  OneIconDiv,
  ReqDiv,
  TextReqDiv,
};
