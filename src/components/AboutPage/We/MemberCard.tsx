import React from 'react';
import styled from 'styled-components';
import Image from 'next/image';
import { Member } from '@/types/member';
import breakPoints from '@/utils/breakPoints';
import Text from '@/components/Common/Text';
import useScreenSize from '@/hooks/useScreenSize';

const StyledCard = styled.div`
  -webkit-user-drag: none;
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;

  display: flex;
  flex-direction: column;
  justify-items: flex-start;
  align-items: center;
  gap: 5px;
  width: 250px;
  margin: 0 42.5px;

  .top {
    margin-top: 5px;
  }

  img {
    pointer-events: none;
  }

  div:hover > img {
    -webkit-filter: grayscale(0%);
    -moz-filter: grayscale(0%);
    filter: grayscale(0%);
  }

  @media ${breakPoints.lg} {
    width: 200px;
    margin: 0 35px;
  }

  @media ${breakPoints.smd} {
    width: 150px;
    margin: 0 25px;
  }

  @media ${breakPoints.sm} {
    width: 150px;
    margin: 0 30px;
  }
`;

// const StyledPhoto = styled.img`
//   filter: grayscale(100%);
//   -webkit-filter: grayscale(100%);
//   -moz-filter: grayscale(100%);

//   user-select: none;
//   --size: 250px;
//   width: var(--size);
//   height: var(--size);

//   border-radius: 50%;

//   object-fit: cover;

//   margin-bottom: 25px;
//   transition: all 0.5s ease;

//   @media ${breakPoints.xl} {
//     /* --size: 280px; */
//     /* --size: 200px; */
//   }

//   @media ${breakPoints.lg} {
//     /* --size: 250px; */
//     --size: 200px;
//   }

//   @media ${breakPoints.smd} {
//     --size: 150px;
//   }

//   @media ${breakPoints.sm} {
//     --size: 150px;
//   }
// `;

const StyledImage = styled(Image)`
  filter: grayscale(100%);
  -webkit-filter: grayscale(100%);
  -moz-filter: grayscale(100%);

  user-select: none;
  /* --size: 250px;
  width: var(--size);
  height: var(--size); */

  border-radius: 50%;

  object-fit: cover;

  /* margin-bottom: 25px; */
  margin: 25px 25px;

  transition: all 0.5s ease;

  /* @media ${breakPoints.xl} {
  }

  @media ${breakPoints.lg} {
    --size: 200px;
  }

  @media ${breakPoints.smd} {
    --size: 150px;
  }

  @media ${breakPoints.sm} {
    --size: 150px;
  } */
`;

const MemberCard = (props: Member): React.ReactElement => {
  const { city, member, photo, phrase, position } = props;
  const [width] = useScreenSize();

  const getImageSize = (screenWidth: number) => {
    if (screenWidth <= 744) {
      return 150;
    }
    if (screenWidth < 1024) {
      return 200;
    }
    return 250;
  };

  const imageSize = getImageSize(width);

  return (
    <StyledCard>
      <StyledImage
        src={photo}
        alt={member}
        width={imageSize}
        height={imageSize}
      />

      <Text variant='h4_n' align='center'>
        {member}
      </Text>
      <Text variant='h4_4' component='p' align='center'>
        {position}
      </Text>
      <Text variant='h4_4' component='p' align='center'>
        {city}
      </Text>
      <Text
        // variant='h4_1'
        variant='text_italic'
        component='p'
        className='top'
        textColor='white80'
        align='center'
        // fontStyle='italic'
      >
        {phrase}
      </Text>
    </StyledCard>
  );
};

export default MemberCard;
