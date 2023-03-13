import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';

export const SliderContainer = styled.section`
  --pagination-height: 1rem;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-x: hidden;
  width: 100%;
  height: clamp(320px, 90svh, 760px);
  background-color: #050505;
`;

export const Slide = styled.div`
  width: 100%;
  height: 100%;
  /* height: calc(760px - var(--pagination-height)); */
  background-color: #050505;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-x: hidden;
  @media ${breakPoints.sm} {
    align-items: start;
  }
`;

export const PaginationContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  height: var(--pagination-height);
`;

export const DotWrapper = styled.div`
  width: var(--pagination-height);
  height: var(--pagination-height);
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const PaginationDot = styled.button`
  width: 6px;
  height: 6px;
  padding: 0;
  border-radius: 50%;
  background-color: var(--main-white-100);
  transition: 0.2s;

  &.active {
    width: 12px;
    height: 12px;
    background-color: var(--main-red-100);
  }
`;
