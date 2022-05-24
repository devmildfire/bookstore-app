import React from 'react';
import Text from '@/components/Common/Text';
import WithArrow from '@/components/Common/WithArrow';
import {
  StyledContent,
  StyledMainText,
  StyledRD,
  StyledSecondaryText,
  StyledWrapper,
} from './styles';

const RD = (): React.ReactElement => (
  <StyledWrapper>
    <Text component='h2' fontFamily='serif' align='center'>
      Литжурнал Русского Динозавра
    </Text>
    <StyledContent>
      <StyledRD />
      <StyledMainText component='p'>
        <Text variant='h2' fontFamily='serif'>
          М
        </Text>
        ы редактируем, иллюстрируем и публикуем лучшие рассказы современников в
        литературном журнале арт-конгрегации
        {' '}
        <Text variant='p' color='red'>
          Русский Динозавр
        </Text>
        {' '}
        — нашего творческого объединения мастеров арт-контента.
      </StyledMainText>
      <StyledSecondaryText component='p'>
        Лучшие рассказы года попадают в ежегодник «Могучий Русский Динозавр».
      </StyledSecondaryText>
      <WithArrow color='red' variant='p'>
        Журнал Русского Динозавра
      </WithArrow>
    </StyledContent>
  </StyledWrapper>
);

export default RD;
