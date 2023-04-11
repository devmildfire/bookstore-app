import Link from 'next/link';
import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';

export const NavHeader = styled(Link)`
  font-size: 40px;
  padding-top: 100px;
  padding-bottom: 50px;
  padding-left: 64px;

  @media ${breakPoints.xl} {
    font-size: 30px;
    padding-top: 100px;
    padding-bottom: 50px;
    padding-left: 50px;
  }

  @media ${breakPoints.lg} {
    font-size: 30px;
    padding-top: 90px;
    padding-bottom: 24px;
    padding-left: 41px;
  }

  @media ${breakPoints.md} {
    padding-left: 20px;
  }

  @media ${breakPoints.smd} {
  }

  @media ${breakPoints.sm} {
    font-size: 20px;
    padding-top: 50px;
    padding-bottom: 32px;
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
  position: fixed;
  z-index: 1;
  /* background: linear-gradient(
      346.55deg,
      rgba(147, 0, 0, 0.1) 1.08%,
      rgba(0, 0, 0, 0.1) 41.58%
    ),
    linear-gradient(
      163.22deg,
      rgba(202, 0, 0, 0.1) 0%,
      rgba(19, 19, 19, 0.1) 31.8%,
      rgba(0, 0, 0, 0.1) 55.09%
    ),
    var(--main-black); */

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
    //  это свойство убирает меню навигации в мобильной версии
    display: none;

    --navWidth: 100%;
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
      ),
      var(--main-black);
  }

  @media ${breakPoints.sm} {
  }
`;
