// import Link from 'next/link';
import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import { Text } from '@/components/Common/Text/Text';

const ContentDiv = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;

  /* outline: 1px solid red;
  * {
    outline: 1px solid green;
  } */

  @media ${breakPoints.md} {
    flex-direction: column-reverse;
  }
`;

const BugDiv = styled.div`
  flex-shrink: 0;
  /* width: 70vw; */
  width: 50%;
  /* width: 250px; */
  max-width: 600px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;

  /* display: grid;
  justify-items: center;
  align-items: center; */

  display: block;

  img {
    position: fixed;
    max-width: 30%;
    top: 40%;
    right: calc((100vw - 1440px) / 2);
  }

  @media ${breakPoints.xxl} {
    img {
      right: 10vw;
    }
  }

  @media ${breakPoints.md} {
    /* flex-direction: row; */
    width: 100%;
    margin: 0 auto;

    img {
      position: unset;
      max-width: 100%;
    }
  }
`;

const ManuscriptDiv = styled.div`
  display: flex;
  flex-direction: column;
  /* gap: var(--block-gap); */
  gap: var(--man-block-gap);

  --padding-top: 100px;
  // --padding-sides: 235px;
  --padding-sides: 0px;
  --padding-bottom: 100px;

  /* padding: var(--padding-top) var(--padding-sides) var(--padding-bottom); */

  @media screen and (max-width: 1900px) {
    --padding-top: 100px;
    // --padding-sides: 96px;
    --padding-sides: 0px;
    --padding-bottom: 200px;
  }

  @media ${breakPoints.xl} {
    --padding-top: 100px;
    // --padding-sides: 96px;
    --padding-sides: 0px;
    --padding-bottom: 200px;
  }

  @media screen and (max-width: 1200px) {
    --padding-top: 90px;
    // --padding-sides: 106px;
    --padding-sides: 0px;
    --padding-bottom: 73px;
  }

  @media ${breakPoints.lg} {
    --padding-top: 90px;
    // --padding-sides: 106px;
    --padding-sides: 0px;
    --padding-bottom: 73px;
  }

  @media ${breakPoints.md} {
    --padding-top: 57px;
    // --padding-sides: 23px;
    --padding-sides: 0px;
    --padding-bottom: 50px;
    gap: 16px;
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
  justify-content: space-between;

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

const Icon = styled.svg`
  * {
    outline: none;
  }

  color: var(--main-white-100);
  transition: all 0.3s ease-in-out;

  /* :hover {
    color: var(--main-red-100);
  } */

  --size: 85px;

  height: var(--size);
  width: var(--size);

  @media ${breakPoints.xl} {
  }

  @media ${breakPoints.lg} {
  }

  @media ${breakPoints.md} {
    --size: 68px;
  }

  @media ${breakPoints.smd} {
  }

  @media ${breakPoints.sm} {
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

  .smalltext {
    font-size: 14px;
  }

  gap: 16px;

  a {
    color: var(--main-red-100);
  }

  a:hover {
    color: red;
    text-decoration: underline;
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

const FaqItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const TextForMobile = styled(Text)`
  display: none;

  @media ${breakPoints.lg} {
    display: block;
  }
`;

export {
  TextDiv,
  ManuscriptDiv,
  IconsDiv,
  Icon,
  OneIconDiv,
  ReqDiv,
  TextReqDiv,
  TextForMobile,
  ContentDiv,
  BugDiv,
  FaqItem,
};
