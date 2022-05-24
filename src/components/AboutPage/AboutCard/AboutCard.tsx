import React from 'react';
import Text from '@/components/Common/Text';
import StyledCard from './styles';
import { AboutInto } from '@/types/aboutInfo';
import { ClassNameProps } from '@/types/className';

export interface AboutCardProps extends AboutInto, ClassNameProps {}

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
