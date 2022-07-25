import React from 'react';
import Text from '@/components/Common/Text';
import StyledCard from './styles';
import { AboutInto } from '@/types/aboutInfo';
import { ClassNameProps } from '@/types/className';

export interface AboutCardProps extends AboutInto, ClassNameProps {}

const AboutCard = (props: AboutCardProps): React.ReactElement => {
  const { content, image, className } = props;
  return (
    <StyledCard className={className} image={image}>
      <Text variant='text' align='center'>
        {content}
      </Text>
    </StyledCard>
  );
};

export default AboutCard;
