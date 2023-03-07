import React from 'react';
import PartnerCard from './PartnerCard';
import partners from '@/mocks/partners';
import Marquee from '@/components/Common/Marquee';

const PartnersList = (): React.ReactElement => {
  return (
    <Marquee speed={25} gap={0} direction='reverse' delay={0}>
      {partners.map((partner) => (
        <PartnerCard {...partner} />
      ))}
    </Marquee>
  );
};

export default PartnersList;
