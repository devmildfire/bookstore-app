import React from 'react';
import PartnerCard from './PartnerCard';
import partners from '@/mocks/partners';
// import Marquee from '@/components/Common/Marquee';
import setUUIDField from '@/utils/setUUIDField';

import useEmblaCarousel, { EmblaOptionsType } from 'embla-carousel-react';
import styled from 'styled-components';
import Autoplay from 'embla-carousel-autoplay';

type EmblaPropType = {
  options?: EmblaOptionsType;
  className: string;
};

const emblaOptions: EmblaOptionsType = {
  loop: true,
  speed: 0.00575,
  direction: 'rtl',
};
const autoplayOptions = { delay: 0, jump: false, stopOnInteraction: false };

const partnersWID = setUUIDField(partners);

const EmblaCarousel: React.FC<EmblaPropType> = ({ options, className }) => {
  const [emblaRef] = useEmblaCarousel(options, [Autoplay(autoplayOptions)]);

  return (
    <div className={className} ref={emblaRef}>
      <div>
        {partnersWID.map((partner) => (
          <PartnerCard {...partner} key={partner.key} />
        ))}
      </div>
    </div>
  );
};

const StyledCarousel = styled(EmblaCarousel)`
  overflow: hidden;
  direction: rtl;

  > div {
    backface-visibility: hidden;
    display: flex;
    touch-action: pan-y;
    flex-direction: row;
  }
`;

const PartnersList = (): React.ReactElement => {
  return (
    <>
      {/* <Marquee speed={25} gap={0} direction='reverse' delay={0}>
        {partnersWID.map((partner) => (
          <PartnerCard {...partner} key={partner.key} />
        ))}
      </Marquee> */}
      <StyledCarousel className='emblaWrapper' options={emblaOptions} />
    </>
  );
};

export default PartnersList;
