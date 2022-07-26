import React, { FC, useMemo } from 'react';
import { Autoplay, FreeMode, Pagination } from 'swiper';
import { SwiperProps } from 'swiper/react';
import { ClassNameProps } from '@/types/className';
import { StyledPagination, StyledSlider, StyledWrapper } from './styles';

export interface SliderProps extends ClassNameProps {
  readonly enabled?: boolean;
  readonly slidesPerView?: number | 'auto';
  readonly withoutPagination?: boolean;
  readonly spaceBetween?: number;
  readonly withoutTouch?: boolean;
  readonly withoutSwipe?: boolean;
  readonly withoutLoop?: boolean;
  readonly freeMode?: boolean;
  readonly additionComponents?: React.ReactNode;
  readonly initialSlide?: number;
  readonly withoutAutoplay?: boolean;
  readonly centeredSlides?: boolean;
}

export const Slider: FC<SliderProps> = (props) => {
  const {
    withoutPagination,
    withoutTouch,
    withoutSwipe,
    withoutLoop,
    additionComponents,
    withoutAutoplay,
    ...params
  } = props;

  const swiperParams = useMemo<SwiperProps>(
    () => ({
      pagination: !withoutPagination && {
        el: '.pagination',
        clickable: true,
        renderBullet: (_, className) => `<span class="${className}"></span>`,
      },
      autoplay: !withoutAutoplay && {
        delay: 2500,
        disableOnInteraction: false,
      },
      loop: !withoutLoop,
      modules: [Autoplay, Pagination, FreeMode],
      allowTouchMove: !withoutTouch,
      preventInteractionOnTransition: withoutSwipe,
    }),
    [
      withoutPagination,
      withoutTouch,
      withoutSwipe,
      withoutLoop,
      withoutAutoplay,
    ],
  );
  return (
    <StyledWrapper>
      <StyledSlider {...params} {...swiperParams} />
      {additionComponents}
      {!withoutPagination && <StyledPagination className='pagination' />}
    </StyledWrapper>
  );
};
