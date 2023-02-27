import React from 'react';
// import { useContext } from 'react';
// import styled from 'styled-components';
// import { DeviceInfoContext } from '@/contexts/DeviceInfoContext';
// import breakPoints from '@/utils/breakPoints';
// import Slide from '@/components/Common/Slide';
// import Slider from '@/components/Common/Slider';
import PartnerCard from './PartnerCard';
import partners from '@/mocks/partners';
import Marquee from '@/components/Common/Marquee';
// import WindowWiderThan from './ScreenSize';

// стилизованный слайдер с параметрами элементов пагинации
// const StyledSlider = styled(Slider)`
//   --swiper-pagination-bullet-horizontal-gap: 35px;
//   --size: 6px;
//   .swiper-wrapper {
//     transition-timing-function: linear;
//   }

//   @media ${breakPoints.lg} {
//     --swiper-pagination-bullet-horizontal-gap: 30px;
//     --size: 4px;
//   }

//   @media ${breakPoints.sm} {
//     --swiper-pagination-bullet-horizontal-gap: 20px;
//     --size: 2px;
//   }
// `;

const PartnersList = (): React.ReactElement => {
  return (
    <Marquee speed={150} gap={0} direction='reverse' delay={0}>
      {partners.map((partner) => (
        <PartnerCard {...partner} />
      ))}
    </Marquee>
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
