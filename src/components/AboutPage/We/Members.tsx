import React, { useContext } from 'react';
import { DeviceInfoContext } from '@/contexts/DeviceInfoContext';
import Slide from '@/components/Common/Slide';
import Slider from '@/components/Common/Slider';
import MemberCard from './MemberCard';
import members from '@/mocks/members';
// import styled from 'styled-components';

const Members = (): React.ReactElement => {
  const { isTabletVertical, isMobile } = useContext(DeviceInfoContext);
  let count = 4;
  if (isMobile) {
    count = 1;
  } else if (isTabletVertical) {
    count = 2;
  }
  return (
    <Slider slidesPerView={count}>
      {members.map((member) => (
        <Slide key={member.id}>
          <MemberCard {...member} />
        </Slide>
      ))}
    </Slider>
  );
};

export default Members;
