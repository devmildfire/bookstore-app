import React from 'react';
// import { useContext } from 'react';
import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
// import { DeviceInfoContext } from '@/contexts/DeviceInfoContext';
import Slide from '@/components/Common/Slide';
import Slider from '@/components/Common/Slider';
import MemberCard from './MemberCard';
import members from '@/mocks/members';
// import { auto } from '@popperjs/core';

// стилизованный слайдер с параметрами элементов пагинации
const StyledSlider = styled(Slider)`
  --swiper-pagination-bullet-horizontal-gap: 35px;
  --size: 6px;

  @media ${breakPoints.lg} {
    --swiper-pagination-bullet-horizontal-gap: 30px;
    --size: 4px;
  }

  @media ${breakPoints.sm} {
    --swiper-pagination-bullet-horizontal-gap: 20px;
    --size: 2px;
  }
`;

const Members = (): React.ReactElement => {
  // const { isTabletVertical, isMobile } = useContext(DeviceInfoContext);
  // let count = 4;
  // if (isMobile) {
  //   count = 1;
  // } else if (isTabletVertical) {
  //   count = 2;
  // }
  return (
    <StyledSlider
      speed={5000}
      duration={0}
      // slidesPerView={3}
      slidesPerView='auto'
      withoutPagination
      // spaceBetween={0}
    >
      {members.map((member) => (
        <Slide key={member.id}>
          <MemberCard {...member} />
        </Slide>
      ))}
    </StyledSlider>
  );
};

export default Members;
