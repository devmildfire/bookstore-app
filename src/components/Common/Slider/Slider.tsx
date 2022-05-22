/* eslint-disable import/no-unresolved */
import React, { PropsWithChildren, useMemo } from 'react';
import { Autoplay, Pagination } from 'swiper';
import { SwiperProps } from 'swiper/react';
import { ClassNameProps } from '../../../types/className';
import { StyledPagination, StyledSlider, StyledWrapper } from './styles';

export interface SliderProps extends ClassNameProps {
  readonly slidesPerView?: number;
  readonly withoutPagination?: boolean;
  readonly spaceBetween?: number;
}

export const Slider = (props: PropsWithChildren<SliderProps>) => {
  const { withoutPagination, ...params } = props;

  const swiperParams = useMemo<SwiperProps>(
    () => ({
      pagination: !withoutPagination && {
        el: '.pagination',
        clickable: true,
        renderBullet: (_, className) => `<span class="${className}"></span>`,
      },
      autoplay: {
        delay: 2500,
        disableOnInteraction: false,
      },
      loop: true,
      modules: [Autoplay, Pagination],
    }),
    [withoutPagination],
  );
  return (
    <StyledWrapper>
      <StyledSlider {...params} {...swiperParams} />
      {!withoutPagination && <StyledPagination className='pagination' />}
    </StyledWrapper>
  );
};
