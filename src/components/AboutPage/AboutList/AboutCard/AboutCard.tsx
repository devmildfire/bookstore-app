import React from 'react';
import styled from 'styled-components';
import Text from '@/components/Common/Text';
import StyledCard from './styles';
import { AboutInto } from '@/types/aboutInfo';
import { ClassNameProps } from '@/types/className';

const StyledCover = styled('img')`
  display: flex;
  object-fit: contain;
  object-position: center;
  border-radius: 4px;
  margin-bottom: 32px;
  filter: saturate(0%);
  transition: 0.6s ease-in-out;
  &:hover {
    filter: saturate(100%);
  }
`;

const StyledText = styled(Text)`
  font-size: 21px;
`;

export interface AboutCardProps extends AboutInto, ClassNameProps {}

const AboutCard = (props: AboutCardProps): React.ReactElement => {
  const { content, image, title, className } = props;
  return (
    <StyledCard className={className}>
      <StyledCover src={image} />
      <StyledText variant='h3_3' align='left'>
        {title}
      </StyledText>
      <Text variant='text' align='left'>
        {content}
      </Text>
    </StyledCard>
  );
};

export default AboutCard;
