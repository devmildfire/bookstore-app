import React from 'react';
import styled from 'styled-components';
import Text from '@/components/Common/Text';
import StyledCard from './styles';
import { AboutInto } from '@/types/aboutInfo';
import { ClassNameProps } from '@/types/className';
import breakPoints from '@/utils/breakPoints';

const StyledCover = styled('img')`
  display: flex;
  object-fit: contain;
  object-position: center;
  border-radius: 4px;
  /* margin-bottom: 32px; */
  filter: saturate(0%);
  transition: 0.6s ease-in-out;
  &:hover {
    filter: saturate(100%);
  }

  @media ${breakPoints.lg} {
    display: block;
    margin-bottom: 0px;
    width: 253px;
  }

  @media ${breakPoints.md} {
    display: block;
    margin-bottom: 0px;
    width: 220px;
  }

  @media ${breakPoints.smd} {
    display: block;
    margin-bottom: 0px;
    width: 200px;
  }

  @media ${breakPoints.sm} {
    display: block;
    margin-bottom: 0px;
    width: 130px;
  }
`;

const StyledText = styled(Text)`
  font-size: 24px;
  height: 70px;

  @media ${breakPoints.lg} {
    font-size: 20px;
    height: 67px;
  }

  @media ${breakPoints.md} {
    height: 60px;
  }

  @media ${breakPoints.smd} {
    font-size: 16px;
    /* padding-bottom: 12px; */
    height: 44px;
  }

  @media ${breakPoints.sm} {
    font-size: 16px;
    padding-bottom: 12px;
    height: auto;
  }
`;

export interface AboutCardProps extends AboutInto, ClassNameProps {}

const AboutCard = (props: AboutCardProps): React.ReactElement => {
  const { content, image, title, className } = props;
  return (
    <StyledCard className={className}>
      <StyledCover src={image} />
      <div>
        <StyledText variant='h3_3' align='left'>
          {title}
        </StyledText>
        <Text variant='text' align='left'>
          {content}
        </Text>
      </div>
    </StyledCard>
  );
};

export default AboutCard;
