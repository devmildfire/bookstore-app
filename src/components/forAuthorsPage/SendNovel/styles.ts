// import Link from 'next/link';
import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';

const NovelDiv = styled.div`
  display: flex;
  gap: 4vw;

  .content {
    display: flex;
    flex-direction: column;
    gap: var(--block-gap);

    a {
      color: var(--main-red-100);
    }

    a:hover {
      color: red;
      text-decoration: underline;
    }
  }

  .PawsDiv {
    position: relative;

    flex-shrink: 0;
    width: 50%;
    max-width: 600px;

    display: flex;
    flex-direction: column;
    justify-content: flex-start;

    @media ${breakPoints.md} {
      width: unset;
      max-width: unset;
      align-items: center;
    }
  }

  @media ${breakPoints.md} {
    flex-direction: column-reverse;
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
  box-sizing: content-box;

  width: 40%;
  max-width: 500px;
  position: fixed;

  right: 0;

  padding-right: calc((100vw - 1440px) / 2);

  @media ${breakPoints.xxl} {
    padding-right: 10vw;
  }

  @media ${breakPoints.lg} {
    padding-right: 5vw;
  }

  @media ${breakPoints.md} {
    position: unset;
    width: unset;
    max-width: 80%;
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
