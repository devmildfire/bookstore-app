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
    padding-bottom: 64px;
    grid-area: text;
  }

  .picture {
    grid-area: picture;
    justify-self: center;
  }

  .link {
    grid-area: link;
    align-self: center;
  }

  span,
  a {
    color: var(--main-red-100);

    :hover {
      color: red;
      text-decoration: underline;
    }
  }

  display: grid;
  grid-template-areas:
    'title picture'
    'text picture'
    'link picture';
  column-gap: 142px;
  column-gap: 6vw;
  row-gap: 0px;

  --padding-top: 100px;
  // --padding-left: 95px;
  // --padding-right: 60px;
  --padding-left: 0px;
  --padding-right: 0px;
  --padding-bottom: 100px;

  padding: var(--padding-top) var(--padding-right) var(--padding-bottom)
    var(--padding-left);

  @media screen and (max-width: 1600px) {
    --padding-top: 100px;
    // --padding-left: 24px;
    // --padding-right: 40px;
    --padding-left: 0px;
    --padding-right: 0px;
    --padding-bottom: 100px;

    grid-template-areas:
      'title picture'
      'text picture'
      'link picture';

    column-gap: 50px;

    /* .picture {
      grid-area: picture;
      justify-self: center;
    } */
  }

  @media ${breakPoints.xl} {
    --padding-top: 100px;
    // --padding-left: 24px;
    // --padding-right: 40px;
    --padding-left: 0px;
    --padding-right: 0px;
    --padding-bottom: 100px;

    grid-template-areas:
      'title picture'
      'text picture'
      'link picture';

    column-gap: 70px;
    /* row-gap: 60px; */

    .text {
      padding-top: 95px;
      padding-bottom: 39px;
      grid-area: text;
      /* align-self: center; */
    }
  }

  @media screen and (max-width: 1200px) {
    grid-template-areas:
      'title picture'
      'text picture'
      'link picture';

    --padding-top: 90px;
    // --padding-left: 14px;
    // --padding-right: 20px;
    --padding-left: 0px;
    --padding-right: 0px;
    --padding-bottom: 100px;

    column-gap: 35px;
    /* row-gap: 60px; */
  }

  @media ${breakPoints.lg} {
    /* grid-template-areas:
      'title picture'
      'text picture'
      'link picture'; */

    grid-template-areas:
      'picture'
      'title'
      'text'
      'link';

    --padding-top: 50px;
    // --padding-left: 31px;
    // --padding-right: 29px;
    --padding-left: 0px;
    --padding-right: 0px;
    --padding-bottom: 70px;

    column-gap: 35px;
    /* row-gap: 60px; */

    .text {
      padding-top: 30px;
      padding-bottom: 39px;
      // padding-left: 5vw;
      // padding-right: 5vw;
      padding-left: 0vw;
      padding-right: 0vw;
      grid-area: text;
      /* align-self: center; */
    }

    .title,
    .link {
      // padding-left: 5vw;
      // padding-right: 5vw;
      padding-left: 0vw;
      padding-right: 0vw;
    }
  }

  @media ${breakPoints.md} {
    grid-template-areas:\
      'picture'
      'title'
      'text'
      'link';

    --padding-top: 50px;
    // --padding-left: 31px;
    // --padding-right: 29px;
    --padding-left: 0px;
    --padding-right: 0px;
    --padding-bottom: 70px;

    column-gap: 10px;
    /* row-gap: 30px; */

    .text {
      padding-top: 30px;
      padding-bottom: 30px;
      // padding-left: 5vw;
      // padding-right: 5vw;
      padding-left: 0vw;
      padding-right: 0vw;
      grid-area: text;
      /* align-self: center; */
    }
  }

  @media ${breakPoints.smd} {
    .text {
      padding-top: 30px;
      padding-bottom: 30px;
      // padding-left: 5vw;
      // padding-right: 5vw;
      padding-left: 0vw;
      padding-right: 0vw;
      grid-area: text;
      /* align-self: center; */
    }
  }

  @media ${breakPoints.sm} {
    .text {
      padding-top: 30px;
      padding-bottom: 30px;
      padding-left: 0vw;
      padding-right: 0vw;
      grid-area: text;
      /* align-self: center; */
    }

    .title,
    .link {
      padding-left: 0vw;
      padding-right: 0vw;
    }
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
  --size: 528px;

  /* height: var(--size); */
  /* width: var(--size); */
  width: 27.5vw;
  /* height: auto; */

  @media screen and (max-width: 1600px) {
    padding-top: 30px;
    width: 444px;
  }

  @media ${breakPoints.xl} {
    /* --size: 444px; */
    padding-top: 90px;
    width: 30vw;
    /* width: 100%; */
    /* padding: 30px 5vw 0px; */
  }

  @media screen and (max-width: 1200px) {
    padding-top: 90px;
    width: 297px;
  }

  @media ${breakPoints.lg} {
    width: 100%;
    // padding: 30px 5vw 0px;
    padding: 30px 0vw 0px;
  }

  @media ${breakPoints.md} {
  }

  @media ${breakPoints.smd} {
  }

  @media ${breakPoints.sm} {
    padding: 50px 0vw 0px;
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
