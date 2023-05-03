import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';

export const StyledList = styled.ul`
  position: sticky;

  //  перемещение меню навигации, чтобы не спрятаться под хедером
  top: calc(var(--header-height) - 1px);
  left: 0px;
  
  z-index: 10;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  width: 100%;
  padding: 0 calc((100vw - var(--width)) / 2);

  background: #49494970;
  backdrop-filter: blur(10px);

  text-transform: uppercase;
  
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
