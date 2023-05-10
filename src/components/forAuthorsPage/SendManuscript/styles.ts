// import Link from 'next/link';
import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import { Text } from '@/components/Common/Text/Text';

const ManuscriptDiv = styled.div`
  /* * {
    outline: 1px solid red;
  } */

  display: flex;
  flex-direction: column;
  gap: 48px;

  --padding-top: 100px;
  // --padding-sides: 235px;
  --padding-sides: 0px;
  --padding-bottom: 100px;

  padding: var(--padding-top) var(--padding-sides) var(--padding-bottom);

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

  gap: 16px;

  span,
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
};
