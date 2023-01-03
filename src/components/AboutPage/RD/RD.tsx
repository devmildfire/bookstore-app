import React from 'react';
import styled from 'styled-components';
import Text from '@/components/Common/Text';
import Button from '@/components/Common/Button';
import {
  StyledContent,
  StyledContentHeading,
  StyledMainText,
  // StyledMainPaddedText,
  // StyledRD,
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

const string1 = 'Мы редактируем, иллюстрируем и публикуем лучшие ';
const s2 = 'рассказы современников в литературном журнале арт-конгрегации ';
const string3 = '— нашего творческого объединения мастеров арт-контента.';

const RD = (): React.ReactElement => (
  <StyledWrapper>
    <StyledContentHeading>
      <Text variant='h2_1_LJ' align='left'>
        Литжурнал Русского Динозавра
      </Text>
    </StyledContentHeading>
    <StyledContent>
      {/* <StyledRD /> */}
      <StyledMainText variant='text'>
        {string1}
        {s2}
        <a href='https://russiandino.ru/'>Русский Динозавр</a>
        {string3}
      </StyledMainText>
      <StyledSecondaryText variant='text'>
        Лучшие рассказы года попадают в&nbsp;ежегодник «
        <a href='https://chtivo.spb.ru/book-moguchij-russkij-dinozavr.html'>
          Могучий Русский Динозавр
        </a>
        ».
      </StyledSecondaryText>
      <StyledButton>Литжурнал Русского Динозавра</StyledButton>
    </StyledContent>
  </StyledWrapper>
);

export default RD;
