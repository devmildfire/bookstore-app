import React from 'react';
import styled from 'styled-components';
import Text from '@/components/Common/Text';
import Button from '@/components/Common/Button';
import {
  StyledContent,
  StyledMainText,
  // StyledMainPaddedText,
  StyledRD,
  StyledSecondaryText,
  // StyledSecondaryPaddedText,
  StyledWrapper,
} from './styles';
import breakPoints from '@/utils/breakPoints';

const StyledButton = styled(Button)`
  /* min-width: 245px; */
  margin-top: 25px;
  max-height: 62px;
  min-height: 62px;
  min-width: 472px;

  &:last-child {
    width: 480;
    align-self: flex-start;
    @media ${breakPoints.smd} {
      align-self: center;
    }
  }

  @media ${breakPoints.lg} {
    align-self: center;
    margin-right: auto;
    margin-top: 0px;
    min-width: 287px;
    max-height: 45px;
    min-height: 45px;
  }

  @media ${breakPoints.smd} {
    align-self: center;
    margin-right: auto;
    min-width: 287px;
    max-height: 32px;
    min-height: 32px;
  }

  @media ${breakPoints.sm} {
    margin: 0 auto;
    align-self: center;
    min-width: 100%;
  }
`;

const RD = (): React.ReactElement => (
  <StyledWrapper>
    <Text variant='h2_1' align='center'>
      Литжурнал Русского Динозавра
    </Text>
    <StyledContent>
      <StyledRD />
      <StyledMainText variant='text'>
        Мы редактируем, иллюстрируем и публикуем лучшие рассказы современников в
        литературном журнале арт-конгрегации Русский Динозавр — нашего
        творческого объединения мастеров арт-контента.
      </StyledMainText>
      <StyledSecondaryText variant='text'>
        Лучшие рассказы года попадают в&nbsp;ежегодник «Могучий Русский
        Динозавр».
      </StyledSecondaryText>
      <StyledButton>Литжурнал Русского Динозавра</StyledButton>
    </StyledContent>
  </StyledWrapper>
);

export default RD;
