import Link from 'next/link';
import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';

export const NavHeader = styled(Link)`
  --fontSize: 40px;
  --paddingforTop: 100px;
  --paddingBottom: 50px;
  font-size: var(--fontSize);
  padding-top: var(--paddingforTop);
  padding-bottom: var(--paddingBottom);
  padding-left: 64px;

  @media ${breakPoints.xl} {
    --fontSize: 30px;
    --paddingforTop: 100px;
    --paddingBottom: 50px;
    padding-left: 50px;
  }

  @media ${breakPoints.lg} {
    --fontSize: 30px;
    --paddingforTop: 90px;
    --paddingBottom: 24px;
    padding-left: 41px;
  }

  @media ${breakPoints.md} {
    padding-left: 20px;
  }

  @media ${breakPoints.smd} {
  }

  @media ${breakPoints.sm} {
    --fontSize: 20px;
    --paddingforTop: 50px;
    --paddingBottom: 32px;
    padding-left: 12px;
  }
`;

export const LinkDiv = styled.div`
  /* outline: 1px solid green; */

  display: flex;
  flex-direction: column;
  justify-content: center;

  --linkDivHeight: 85px;
  min-height: var(--linkDivHeight);

  padding-left: 64px;

  transition: all 250ms ease-in;

  :hover,
  :focus-visible {
    /* color: var(--main-red-100); */
    outline: none;

    background: linear-gradient(
        92.67deg,
        rgba(147, 0, 0, 0.2) 1.51%,
        rgba(19, 19, 19, 0.2) 43.58%,
        rgba(0, 0, 0, 0.2) 100.87%
      ),
      rgba(0, 0, 0, 0.3);
  }

  @media ${breakPoints.xl} {
    --linkDivHeight: 65px;
    padding-left: 50px;
  }

  @media ${breakPoints.lg} {
    --linkDivHeight: 60px;
    padding-left: 41px;
  }

  @media ${breakPoints.md} {
    padding-left: 20px;
  }

  @media ${breakPoints.smd} {
  }

  @media ${breakPoints.sm} {
    --linkDivHeight: 44px;
    padding-left: 12px;
  }
`;

export const NavDiv = styled.div`
  /* outline: 1px solid red; */

  /* background: linear-gradient(
      346.55deg,
      rgba(147, 0, 0, 0.5 * 0.3) 1.08%,
      rgba(0, 0, 0, 0.5 * 0.3) 41.58%
    ),
    linear-gradient(163.22deg, #ca0000 0%, #131313 31.8%, #000000 55.09%); */

  background: linear-gradient(
      346.55deg,
      rgba(147, 0, 0, 0.1) 1.08%,
      rgba(0, 0, 0, 0.1) 41.58%
    ),
    linear-gradient(
      163.22deg,
      rgba(202, 0, 0, 0.1) 0%,
      rgba(19, 19, 19, 0.1) 31.8%,
      rgba(0, 0, 0, 0.1) 55.09%
    );

  --navWidth: 450px;
  display: flex;
  flex-direction: column;
  width: var(--navWidth);
  gap: 10px;

  @media ${breakPoints.xl} {
    --navWidth: 338px;
  }

  @media ${breakPoints.lg} {
    --navWidth: 314px;
  }

  @media ${breakPoints.md} {
  }

  @media ${breakPoints.smd} {
    --navWidth: 100%;
  }

  @media ${breakPoints.sm} {
  }
`;
