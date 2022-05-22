/* eslint-disable import/no-unresolved */
import React, { useContext } from 'react';
import styled from 'styled-components';
import { SwiperSlide } from 'swiper/react';
import DeviceInfoContext from '../../../contexts/DeviceInfoContext';
import members from '../../../mocks/members';
import Slider from '../../Common/Slider';
import MemberCard from './MemberCard';

const StyledWrapper = styled.div`
  display: grid;
`;

const StyledSlider = styled.div`
  max-width: max-content;
  margin: 0 auto;
`;

const Members = () => {
  const { isTabletVertical, isMobile } = useContext(DeviceInfoContext);
  let count = 3;
  if (isMobile) {
    count = 1;
  } else if (isTabletVertical) {
    count = 2;
  }
  return (
    <StyledWrapper>
      <Slider
        withoutPagination={isTabletVertical || isMobile}
        slidesPerView={count}
        spaceBetween={0}
      >
        {members.map((member) => (
          <SwiperSlide>
            <StyledSlider>
              <MemberCard {...member} />
            </StyledSlider>
          </SwiperSlide>
        ))}
      </Slider>
    </StyledWrapper>
  );
};

export default Members;
