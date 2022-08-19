import React from 'react';
import styled from 'styled-components';
import Text from '@/components/Common/Text';
import Button from '@/components/Common/Button';
import {
  StyledContent,
  StyledMainText,
  StyledRD,
  StyledSecondaryText,
  StyledWrapper,
} from './styles';

const StyledButton = styled(Button)`
  min-width: 480px;
  &:last-child {
    width: 480;
    align-self: flex-start;
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
        Лучшие рассказы года попадают в ежегодник «Могучий Русский Динозавр».
      </StyledSecondaryText>
      <StyledButton>Журнал Русского Динозавра</StyledButton>
    </StyledContent>
  </StyledWrapper>
);

export default RD;
