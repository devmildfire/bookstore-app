import React from 'react';
import Text from '@/components/Common/Text';
import WithArrow from '@/components/Common/WithArrow';
import {
  StyledContent,
  StyledMainText,
  StyledRD,
  StyledSecondaryText,
  StyledWrapper
} from './styles';

const RD = (): React.ReactElement => (
  <StyledWrapper>
    <Text variant='h2_1' align='center'>
      Литжурнал Русского Динозавра
    </Text>
    <StyledContent>
      <StyledRD />
      <StyledMainText variant='text'>
        <Text variant='h2_1' component='span'>
          М
        </Text>
        ы редактируем, иллюстрируем и публикуем лучшие рассказы современников в
        литературном журнале арт-конгрегации &nbsp;
        <Text variant='text' component='span' textColor='red'>
          Русский Динозавр
        </Text>
        &nbsp;— нашего творческого объединения мастеров арт-контента.
      </StyledMainText>
      <StyledSecondaryText variant='text'>
        Лучшие рассказы года попадают в ежегодник «Могучий Русский Динозавр».
      </StyledSecondaryText>
      <WithArrow textColor='red' variant='text' component='span'>
        Журнал Русского Динозавра
      </WithArrow>
    </StyledContent>
  </StyledWrapper>
);

export default RD;
