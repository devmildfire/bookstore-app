import React from 'react';
import styled from 'styled-components';
import { Partner } from '@/types/partner';
import breakPoints from '@/utils/breakPoints';
import Text from '@/components/Common/Text';

const StyledLogo = styled.img`
  --size: 150px;
  /* width: var(--size); */
  height: auto;
  /* height: 150px; */
  /* width: var(--size); */
  width: 100%;
  aspect-ratio: 1/1;
  object-fit: contain;

  /* display: flex;
  justify-content: center;
  align-items: center; */

  margin: auto;

  /* object-fit: cover; */
  object-fit: contain;
  /* background-color: rgba(18, 18, 18, 0.5);
  backdrop-filter: blur(8px); */

  @media ${breakPoints.xl} {
    /* --size: 280px; */
    --size: 150px;
  }

  @media ${breakPoints.lg} {
    /* --size: 250px; */
    --size: 125px;
  }

  @media ${breakPoints.md} {
    --size: 100;
  }

  @media ${breakPoints.smd} {
    --size: 70px;
  }

  @media ${breakPoints.sm} {
    --size: 70px;
  }
`;

const StyledCard = styled.div`
  background-color: rgba(18, 18, 18, 0.5);
  backdrop-filter: blur(8px);

  border-radius: 5%;
  /* margin-bottom: 60px; */
  /* padding: 30px 30px; */
  display: grid;
  justify-content: center;
  align-content: center;

  /* justify-items: center;
  align-items: center; */
  /* display: flex;
  flex-direction: column;
  justify-items: center;
  align-items: center; */
  gap: 5px;
  height: 250px;
  width: 250px;
  margin: 0 42.5px;
  /* margin-bottom: 50px; */

  .top {
    margin-top: 5px;
  }

  @media ${breakPoints.lg} {
    width: 200px;
    height: 200px;
    margin: 0 35px;
  }

  @media ${breakPoints.smd} {
    /* width: 100%; */
    width: 150px;
    height: 150px;
    /* padding: 5px 5px; */
    margin: 0 25px;
    /* margin-bottom: 30px; */
  }

  @media ${breakPoints.sm} {
    /* width: 100%; */
    width: 150px;
    height: 150px;
    /* padding: 5px 5px; */
    margin: 0 30px;
    /* margin-bottom: 30px; */
  }
`;

const PartnerCard = (props: Partner): React.ReactElement => {
  const { name, photo, displayName } = props;

  return (
    <StyledCard>
      <StyledLogo src={photo} alt={name} />
      <Text variant='h4_p' component='p' align='center'>
        {displayName}
      </Text>
    </StyledCard>
  );
};

export default PartnerCard;
