import React from 'react';
import Text from '../../Common/Text';
import StyledCard from './styles';

export interface AboutCardProps {
  readonly content: string;
  readonly image?: string;
}

const AboutCard = (props: AboutCardProps): React.ReactElement => {
  const { content, image } = props;
  return (
    <StyledCard image={image}>
      <Text component='span' align='center'>
        {content}
      </Text>
    </StyledCard>
  );
};

export default AboutCard;
