import React from 'react';
import PartnerCard from './PartnerCard';
import partners from '@/mocks/partners';
import Marquee from '@/components/Common/Marquee';
import setUUIDField from '@/utils/setUUIDField';

const partnersWID = setUUIDField(partners);

const PartnersList = (): React.ReactElement => {
  return (
    <Marquee speed={25} gap={0} direction='reverse' delay={0}>
      {partnersWID.map((partner) => (
        <PartnerCard {...partner} key={partner.key} />
      ))}
    </Marquee>
  );
};

export default PartnersList;
