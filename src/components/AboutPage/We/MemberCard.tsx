import React from 'react';
import styled from 'styled-components';
import { Member } from '@/types/member';
import breakPoints from '@/utils/breakPoints';
import Text from '@/components/Common/Text';

const StyledCard = styled.div`
  display: grid;
  justify-items: center;
  gap: 5px;

  width: 340px;

  .top {
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
      <Text variant='text' align='center'>
        {member}
      </Text>
      <Text variant='h4_1' component='p' align='center'>
        {position}
      </Text>
      <Text variant='h4_1' component='p' align='center'>
        {city}
      </Text>
      <Text
        variant='h4_1'
        component='p'
        className='top'
        textColor='red'
        align='center'
      >
        {phrase}
      </Text>
    </StyledCard>
  );
};

export default MemberCard;
