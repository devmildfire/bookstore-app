import React from 'react';
import styled from 'styled-components';
import Image from 'next/image';
import { Partner } from '@/types/partner';
import breakPoints from '@/utils/breakPoints';
import Text from '@/components/Common/Text';
import useScreenSize from '@/hooks/useScreenSize';

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
  grid-area: 1/2;
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
      <StyledLogoImage
        src={photo}
        alt={name}
        width={imageSize}
        height={imageSize}
        // layout='fill' этот параметр не работает для сафари
      />
      <Text variant='h4_p' component='p' align='center'>
        {displayName}
      </Text>
    </StyledCard>
  );
};

export default PartnerCard;
