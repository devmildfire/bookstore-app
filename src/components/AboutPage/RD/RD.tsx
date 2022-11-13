import React from 'react';
import styled from 'styled-components';
import Text from '@/components/Common/Text';
import Button from '@/components/Common/Button';
import {
  StyledContent,
  // StyledMainText,
  StyledMainPaddedText,
  StyledRD,
  // StyledSecondaryText,
  StyledSecondaryPaddedText,
  StyledWrapper,
} from './styles';
import breakPoints from '@/utils/breakPoints';

const StyledButton = styled(Button)`
  min-width: 280px;
  &:last-child {
    width: 480;
    align-self: flex-start;
  }

  @media ${breakPoints.sm} {
    margin: 0 auto;
    align-self: center;
  }
`;

const RD = (): React.ReactElement => (
  <StyledWrapper>
    <Text variant='h2_1' align='center'>
      Литжурнал Русского Динозавра
    </Text>
    <StyledContent>
      <StyledRD />
      <StyledMainPaddedText variant='paddedText'>
        Мы редактируем, иллюстрируем и публикуем лучшие рассказы современников в
        литературном журнале арт-конгрегации Русский Динозавр — нашего
        творческого объединения мастеров арт-контента.
      </StyledMainPaddedText>
      <StyledSecondaryPaddedText variant='paddedText'>
        Лучшие рассказы года попадают в ежегодник «Могучий Русский Динозавр».
      </StyledSecondaryPaddedText>
      <StyledButton>Журнал Русского Динозавра</StyledButton>
    </StyledContent>
  </StyledWrapper>
);

export default RD;
