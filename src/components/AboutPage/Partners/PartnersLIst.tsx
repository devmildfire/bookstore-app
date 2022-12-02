import React, { useContext } from 'react';
import styled from 'styled-components';
import { DeviceInfoContext } from '@/contexts/DeviceInfoContext';
import breakPoints from '@/utils/breakPoints';
import Slide from '@/components/Common/Slide';
import Slider from '@/components/Common/Slider';
import PartnerCard from './PartnerCard';
import partners from '@/mocks/partners';
import WindowWiderThan from './ScreenSize';

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

const PartnersList = (): React.ReactElement => {
  const { isMobile, isTabletVertical } = useContext(DeviceInfoContext);
  // let count = 4;
  // if (isMobile) {
  //   count = 3;
  // } else if (isTabletVertical) {
  //   count = 3;
  // }

  const isWide = WindowWiderThan(1440);
  const count = isWide ? 4 : 3;

  return (
    // <StyledList
    //   withoutPagination
    //   withoutSwipe
    //   withoutTouch
    //   slidesPerView={count}
    //   spaceBetween={20}
    //   centeredSlides
    // >
    //   {partners.map((partner) => (
    //     <Slide key={partner.id}>
    //       <PartnerCard {...partner} />
    //     </Slide>
    //   ))}
    // </StyledList>
    <StyledSlider
      withoutPagination={isTabletVertical || isMobile}
      slidesPerView={count}
    >
      {partners.map((partner) => (
        <Slide key={partner.id}>
          <PartnerCard {...partner} />
        </Slide>
      ))}
    </StyledSlider>
  );
};

// const PartnersList = (): React.ReactElement => {
//   const { isMobile, isTabletVertical } = useContext(DeviceInfoContext);
//   let count = 4;
//   if (isMobile) {
//     count = 1.5;
//   } else if (isTabletVertical) {
//     count = 2.5;
//   }
//   return (
//     <StyledList
//       withoutPagination
//       withoutSwipe
//       withoutTouch
//       slidesPerView={count}
//       spaceBetween={20}
//       centeredSlides
//     >
//       {partners.map((partner) => (
//         <Slide key={partner.id}>
//           <PartnerCard {...partner} />
//         </Slide>
//       ))}
//     </StyledList>
//   );
// };

export default PartnersList;
