import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';

export const StyledList = styled.ul`
  position: fixed;
  transform: translate(0, -1px);
  z-index: 10;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  // justify-content: space-around;
  align-items: center;

  width: 100%;
  // max-width: var(--width);
  padding: 0 calc((100vw - var(--width)) / 2);

  // margin: 0 auto;
  background: #49494970;
  backdrop-filter: blur(10px);

  text-transform: uppercase;
  /* background-color: grey; */

  height: 40px;

  @media ${breakPoints.xxl} {
    padding: 0 10vw 2px;
  }

  @media screen and (max-width: 1600px) {
    height: 35px;
  }

  @media ${breakPoints.xl} {
    height: 35px;
  }

  @media screen and (max-width: 1200px) {
    height: 30px;
  }

  @media ${breakPoints.lg} {
    display: none;
  }
`;
