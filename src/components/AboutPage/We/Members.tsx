import React from 'react';
import Marquee from '@/components/Common/Marquee';
import MemberCard from './MemberCard';
import members from '@/mocks/members';

const Members = (): React.ReactElement => {
  return (
    <Marquee speed={75} gap={0} direction='normal' delay={0}>
      {members.map((member) => (
        <MemberCard {...member} />
      ))}
    </Marquee>
  );
};

export default Members;
