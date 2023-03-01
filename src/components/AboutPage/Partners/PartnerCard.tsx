import React from 'react';
import styled from 'styled-components';
import Image from 'next/image';
import { Partner } from '@/types/partner';
import breakPoints from '@/utils/breakPoints';
import Text from '@/components/Common/Text';
// import useScreenSize from '@/hooks/useScreenSize';

// const StyledLogo = styled.img`
//   pointer-events: none;
//   -moz-user-select: none;
//   -webkit-user-select: none;
//   user-select: none;
//   --size: 150px;

//   height: auto;

//   width: 100%;
//   aspect-ratio: 1/1;
//   object-fit: contain;

//   margin: auto;

//   object-fit: contain;

//   @media ${breakPoints.xl} {
//     --size: 150px;
//   }

//   @media ${breakPoints.lg} {
//     --size: 125px;
//   }

//   @media ${breakPoints.md} {
//     --size: 100;
//   }

//   @media ${breakPoints.smd} {
//     --size: 70px;
//   }

//   @media ${breakPoints.sm} {
//     --size: 70px;
//   }
// `;

const StyledLogoImage = styled(Image)`
  pointer-events: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  user-select: none;
  height: auto;
  width: 100%;
  aspect-ratio: 1/1;
  object-fit: contain;
  margin: auto;
  object-fit: contain;
`;

const StyledCard = styled.div`
  background-color: rgba(18, 18, 18, 0.5);
  backdrop-filter: blur(8px);

  border-radius: 5%;

  display: grid;
  justify-content: center;
  align-content: center;

  gap: 5px;
  height: 250px;
  width: 250px;
  margin: 0 42.5px;

  .top {
    margin-top: 5px;
  }

  @media ${breakPoints.lg} {
    width: 200px;
    height: 200px;
    margin: 0 35px;
  }

  @media ${breakPoints.smd} {
    width: 150px;
    height: 150px;
    margin: 0 25px;
  }

  @media ${breakPoints.sm} {
    width: 150px;
    height: 150px;
    margin: 0 10px;
  }
`;

const PartnerCard = (props: Partner): React.ReactElement => {
  const { name, photo, displayName } = props;
  // const [width] = useScreenSize();

  // const getImageSize = (screenWidth: number) => {
  //   if (screenWidth <= 744) {
  //     return 70;
  //   }
  //   if (screenWidth < 830) {
  //     return 100;
  //   }
  //   if (screenWidth < 1024) {
  //     return 125;
  //   }
  //   return 150;
  // };

  // const imageSize = getImageSize(width);

  return (
    <StyledCard>
      <StyledLogoImage src={photo} alt={name} layout='fill' />
      <Text variant='h4_p' component='p' align='center'>
        {displayName}
      </Text>
    </StyledCard>
  );
};

export default PartnerCard;
