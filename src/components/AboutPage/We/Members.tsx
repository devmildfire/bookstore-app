import React from 'react';
// import Marquee from '@/components/Common/Marquee';
import MemberCard from './MemberCard';
import members from '@/mocks/members';
import setUUIDField from '@/utils/setUUIDField';

import useEmblaCarousel from 'embla-carousel-react';
import { EmblaOptionsType } from 'embla-carousel';

import styled from 'styled-components';
import Autoplay from 'embla-carousel-autoplay';

const MembersWID = setUUIDField(members);

type EmblaPropType = {
  options?: EmblaOptionsType;
  className: string;
};

const emblaOptions = { loop: true, duration: 50000 };
const autoplayOptions = {
  delay: 0,
  jump: false,
  stopOnInteraction: false,
};

const EmblaCarousel: React.FC<EmblaPropType> = ({ options, className }) => {
  const [emblaRef] = useEmblaCarousel(options, [Autoplay(autoplayOptions)]);

  return (
    <div className={className} ref={emblaRef}>
      <div>
        {MembersWID.map((member) => (
          <MemberCard {...member} key={member.key} />
        ))}
      </div>
    </div>
  );
};

const StyledCarousel = styled(EmblaCarousel)`
  cursor: grab;
  :active {
    cursor: grabbing;
  }

  overflow: hidden;

  > div {
    backface-visibility: hidden;
    display: flex;
    touch-action: pan-y;
    flex-direction: row;
  }
`;

const Members = (): React.ReactElement => {
  return (
    <>
      <StyledCarousel className='emblaWrapper' options={emblaOptions} />
    </>
  );
};

export default Members;
