import React from 'react';
// import styled from 'styled-components';
// import breakPoints from '@/utils/breakPoints';
// import Slide from '@/components/Common/Slide';
// import Slider from '@/components/Common/Slider';
import Marquee from '@/components/Common/Marquee';
import MemberCard from './MemberCard';
import members from '@/mocks/members';

const Members = (): React.ReactElement => {
  return (
    <Marquee speed={50} gap={0} direction='normal' delay={0}>
      {members.map((member) => (
        <MemberCard {...member} />
      ))}
    </Marquee>
  );
};

export default Members;
