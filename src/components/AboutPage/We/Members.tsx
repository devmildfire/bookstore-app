import React from 'react';
import Marquee from '@/components/Common/Marquee';
import MemberCard from './MemberCard';
import members from '@/mocks/members';
import setUUIDField from '@/utils/setUUIDField';

const MembersWID = setUUIDField(members);

const Members = (): React.ReactElement => {
  return (
    <Marquee speed={25} gap={0} direction='normal' delay={0}>
      {MembersWID.map((member) => (
        <MemberCard {...member} key={member.key} />
      ))}
    </Marquee>
  );
};

export default Members;
