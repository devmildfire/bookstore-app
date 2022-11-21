import React from 'react';
import styled from 'styled-components';
import { Member } from '@/types/member';
import breakPoints from '@/utils/breakPoints';
import Text from '@/components/Common/Text';

const StyledCard = styled.div`
  /* display: grid; */
  display: flex;
  flex-direction: column;
  justify-items: flex-start;
  align-items: center;
  gap: 5px;
  max-height: 520px;
  width: 340px;
  margin-left: 30px;
  margin-right: 30px;
  margin-bottom: 50px;

  .top {
    margin-top: 5px;
  }

  @media ${breakPoints.lg} {
    width: 250px;
    margin-left: 20px;
    margin-right: 20px;
  }

  @media ${breakPoints.sm} {
    width: 100%;
    margin-bottom: 30px;
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
    /* --size: 280px; */
    --size: 200px;
  }

  @media ${breakPoints.lg} {
    /* --size: 250px; */
    --size: 170px;
  }

  @media ${breakPoints.sm} {
    --size: 150px;
  }
`;

const MemberCard = (props: Member): React.ReactElement => {
  const { city, member, photo, phrase, position } = props;

  return (
    <StyledCard>
      <StyledPhoto src={photo} alt={member} />
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
        textColor='red'
        align='center'
        // fontStyle='italic'
      >
        {phrase}
      </Text>
    </StyledCard>
  );
};

export default MemberCard;
