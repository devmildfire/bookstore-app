/* eslint-disable import/prefer-default-export */
import styled from 'styled-components';
import { SwiperSlide } from 'swiper/react';

export default styled(SwiperSlide)`
  display: flex;
  justify-content: center;
  /* специальный хак, который позволяет сделать равный друг другу постоянный размер слайдов */
  flex-shrink: 100 !important;
  /* width: 450px; */
`;
