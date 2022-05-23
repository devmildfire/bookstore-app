import React, { useContext } from 'react';
import DeviceInfoContext from '../../../contexts/DeviceInfoContext';
import members from '../../../mocks/members';
import Slide from '../../Common/Slide';
import Slider from '../../Common/Slider';
import MemberCard from './MemberCard';

const Members = () => {
  const { isTabletVertical, isMobile } = useContext(DeviceInfoContext);
  let count = 3;
  if (isMobile) {
    count = 1;
  } else if (isTabletVertical) {
    count = 2;
  }
  return (
    <Slider
      withoutPagination={isTabletVertical || isMobile}
      slidesPerView={count}
    >
      {members.map((member) => (
        <Slide key={member.id}>
          <MemberCard {...member} />
        </Slide>
      ))}
    </Slider>
  );
};

export default Members;
