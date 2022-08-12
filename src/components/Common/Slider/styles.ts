import styled from 'styled-components';
import { Swiper } from 'swiper/react';
import breakPoints from '@/utils/breakPoints';

export const StyledWrapper = styled.div`
  display: grid;
  gap: 50px;
`;

export const StyledPagination = styled.div`
  --size: 6px;

  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;

  height: calc(var(--size) * 1.9);

  .swiper-pagination-bullet {
    display: inline-block;

    width: var(--size);
    height: var(--size);

    opacity: 1;

    background-color: var(--main-white-100);

    transition: transform ease-in 0.15s;
    transform-origin: center;
  }
  .swiper-pagination-bullet-active,
  .swiper-pagination-bullet:hover,
  .swiper-pagination-bullet:focus-visible {
    transform: scale(1.9);
  }

  .swiper-pagination-bullet-active {
    color: #fff;
    background-color: #930000;

    transform: scale(1.9);
  }

  @media ${breakPoints.sm} {
    --size: 6px;
  }
`;

export const StyledSlider = styled(Swiper)`
  height: auto;
  width: 100%;
`;
