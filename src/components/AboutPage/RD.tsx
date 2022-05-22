import React from 'react';
import styled from 'styled-components';
import breakPoints from '../../utils/breakPoints';
import Text from '../Common/Text';
import RDImage from '../../assets/images/dino.png';

const StyledWrapper = styled.section`
  display: grid;
  gap: 50px;
`;

const StyledContent = styled.div`
  --RDOffset: 0px;

  position: relative;
  z-index: 0;

  display: grid;
  grid-template-rows: repeat(2, min-content) 1fr;
  gap: 67px;

  height: 825px;

  > :last-child {
    align-self: end;
  }

  .red {
    color: #930000;
  }

  padding-top: 78px;

  @media ${breakPoints.xl} {
    gap: 20px;
    height: calc(618px + var(--RDOffset));

    padding-top: 0;

    --RDOffset: 118px;
  }

  @media ${breakPoints.lg} {
    gap: 30px;
    height: 521px;

    --RDOffset: 0px;
  }

  @media ${breakPoints.md} {
    gap: 18px;
    height: 420px;
  }

  @media ${breakPoints.sm} {
    grid-template-rows: repeat(3, min-content);
    gap: 15px;

    height: min-content;
  }
`;

const StyledRD = styled.div`
  position: absolute;
  inset: 0;
  z-index: -1;

  background-image: url(${RDImage.src});
  background-repeat: no-repeat;
  background-position: calc(100% + 130px) calc(50% + var(--RDOffset));
  background-size: 80%;

  @media ${breakPoints.sm} {
    background: none;
  }
`;

const StyledMainText = styled(Text)`
  --width: 720px;

  width: var(--width);

  @media ${breakPoints.xl} {
    --width: 640px;
  }

  @media ${breakPoints.lg} {
    --width: 450px;
  }

  @media ${breakPoints.md} {
    --width: 350px;
  }

  @media ${breakPoints.sm} {
    --width: 100%;
  }
`;

const StyledSecondaryText = styled(StyledMainText)`
  width: calc(var(--width) - 10%);

  @media ${breakPoints.sm} {
    width: 100%;
  }
`;

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
