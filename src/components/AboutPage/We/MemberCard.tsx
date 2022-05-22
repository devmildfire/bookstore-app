import React from 'react';
import styled from 'styled-components';
import { Member } from '../../../types/member';
import breakPoints from '../../../utils/breakPoints';
import Text from '../../Common/Text';

const StyledCard = styled.div`
  display: grid;
  justify-items: center;
  gap: 5px;

  width: 340px;

  .red {
    color: #930000;

    margin-top: 5px;
  }

  @media ${breakPoints.lg} {
    width: 250px;
  }

  @media ${breakPoints.sm} {
    width: 100%;
  }
`;

const StyledPhoto = styled.img`
  --size: 300px;
  width: var(--size);
  height: var(--size);

  border-radius: 50%;

  object-fit: cover;

  margin-bottom: 25px;

  @media ${breakPoints.xl} {
    --size: 280px;
  }

  @media ${breakPoints.lg} {
    --size: 250px;
  }

  @media ${breakPoints.sm} {
    --size: 150px;
  }
`;

const MemberCard = (props: Member): React.ReactElement => {
  const {
    city, member, photo, phrase, position,
  } = props;

  return (
    <StyledCard>
      <StyledPhoto src={photo} alt={member} />
      <Text variant='body1' align='center'>
        {member}
      </Text>
      <Text variant='body1' align='center'>
        {position}
      </Text>
      <Text variant='body1' align='center'>
        {city}
      </Text>
      <Text variant='body1' className='red' align='center'>
        {phrase}
      </Text>
    </StyledCard>
  );
};

export default MemberCard;
