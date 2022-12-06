import React from 'react';
import styled from 'styled-components';
import { Partner } from '@/types/partner';
import breakPoints from '@/utils/breakPoints';
import Text from '@/components/Common/Text';

const StyledLogo = styled.img`
  --size: 200px;
  /* width: var(--size); */
  height: auto;
  /* height: 150px; */
  width: var(--size);

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

  @media ${breakPoints.sm} {
    --size: 45px;
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
  height: 300px;
  width: 300px;
  margin-left: 70px;
  margin-right: 70px;
  /* margin-bottom: 50px; */

  .top {
    margin-top: 5px;
  }

  @media ${breakPoints.lg} {
    width: 245px;
    height: 245px;
    margin-left: 46px;
    margin-right: 46px;
  }

  @media ${breakPoints.sm} {
    /* width: 100%; */
    width: 83px;
    height: 83px;
    /* padding: 5px 5px; */
    margin-left: 15px;
    margin-right: 15px;
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
