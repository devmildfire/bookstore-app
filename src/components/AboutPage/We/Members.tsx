import React from 'react';
import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import Slide from '@/components/Common/Slide';
import Slider from '@/components/Common/Slider';
import MemberCard from './MemberCard';
import members from '@/mocks/members';

// стилизованный слайдер с параметрами элементов пагинации
const StyledSlider = styled(Slider)`
  --swiper-pagination-bullet-horizontal-gap: 35px;
  --size: 6px;
  .swiper-wrapper {
    transition-timing-function: linear;
  }

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
  return (
    <StyledSlider
      speed={10000}
      duration={0}
      slidesPerView='auto'
      withoutPagination
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
