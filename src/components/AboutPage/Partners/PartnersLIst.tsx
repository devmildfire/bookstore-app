import React, { useContext } from 'react';
import styled from 'styled-components';
import DeviceInfoContext from '@/contexts/DeviceInfoContext';
import breakPoints from '@/utils/breakPoints';
import Slide from '@/components/Common/Slide';
import Slider from '@/components/Common/Slider';
import PartnerCard from './PartnerCard';
import partners from '@/mocks/partners';

const StyledList = styled(Slider)`
  display: flex;
  justify-content: space-between;
  gap: 70px;

  @media ${breakPoints.xl} {
    gap: 50px;
  }

  @media ${breakPoints.lg} {
    gap: 30px;
  }

  @media ${breakPoints.md} {
    gap: 20px;
  }

  @media ${breakPoints.sm} {
    gap: 10px;
  }
`;

const PartnersList = (): React.ReactElement => {
  const { isMobile, isTabletVertical } = useContext(DeviceInfoContext);
  let count = 3;
  if (isMobile) {
    count = 1.5;
  } else if (isTabletVertical) {
    count = 2.5;
  }
  return (
    <StyledList
      withoutPagination
      withoutSwipe
      withoutTouch
      slidesPerView={count}
      spaceBetween={20}
      centeredSlides
    >
      {partners.map((partner) => (
        <Slide key={partner.id}>
          <PartnerCard {...partner} />
        </Slide>
      ))}
    </StyledList>
  );
};

export default PartnersList;
