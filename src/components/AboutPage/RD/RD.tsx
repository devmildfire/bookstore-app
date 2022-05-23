import React from 'react';
import Text from '../../Common/Text';
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
        <Text variant='p' className='red'>
          Русский Динозавр
        </Text>
        {' '}
        — нашего творческого объединения мастеров арт-контента.
      </StyledMainText>
      <StyledSecondaryText component='p'>
        Лучшие рассказы года попадают в ежегодник «Могучий Русский Динозавр».
      </StyledSecondaryText>
      <Text>asdfasdfasdf</Text>
    </StyledContent>
  </StyledWrapper>
);

export default RD;
