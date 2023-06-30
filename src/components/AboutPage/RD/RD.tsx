import React, { useRef } from 'react';
import styled from 'styled-components';
import Text from '@/components/Common/Text';
import Button from '@/components/Common/Button';
import {
  StyledContent,
  StyledMainText,
  StyledSecondaryText,
  StyledWrapper,
} from './styles';
import breakPoints from '@/utils/breakPoints';
import litMagIcon from '@/assets/icons/litmagIcon.svg';
import MovingPicsGrid from '@/components/Common/MovingPicsGrid';

const StyledButton = styled(Button)`
  display: block;
  padding: 0 40px;

  max-width: var(--box-width);
  width: calc(0.45 * var(--box-width));
  margin: 2% auto;

  max-height: 60px;
  min-height: 60px;

  @media ${breakPoints.xxl} {
    align-self: center;
    width: calc(0.6 * var(--box-width));
    max-height: 60px;
    min-height: 60px;
  }

  @media ${breakPoints.xl} {
    padding: 0 30px;

    align-self: center;
    width: calc(0.6 * var(--box-width));
    max-height: 60px;
    min-height: 60px;
  }

  @media ${breakPoints.lg} {
    padding: 0 20px;
    align-self: center;
    margin: 0.5% auto 2% auto;
    max-height: 45px;
    min-height: 45px;
    width: calc(0.45 * var(--box-width));
  }

  @media ${breakPoints.md} {
    /* padding: 0 10px; */
    align-self: center;
    margin-right: auto;
    max-height: 45px;
    min-height: 45px;
    width: calc(0.6 * var(--box-width));
  }

  @media ${breakPoints.smd} {
    align-self: center;
    margin-right: auto;
    max-height: 32px;
    min-height: 32px;
    /* width: calc(0.7 * var(--box-width)); */
    width: 100%;
  }

  @media ${breakPoints.sm} {
    margin: 0 auto;
    align-self: center;
    padding: 0;
  }
`;

const string1 = 'Мы редактируем, иллюстрируем и публикуем лучшие ';
const s2 =
  'рассказы современников в литературном журнале арт\u2011конгрегации ';
const string3 = ' — нашего творческого объединения мастеров арт\u2011контента.';

const RDIcon = styled.svg`
  stroke: var(--main-white-100);
  margin: 0 auto;
  height: 85px;
  width: auto;

  @media ${breakPoints.xxl} {
    height: calc(4.464285vw - 0.71428px);
  }

  @media ${breakPoints.lg} {
    height: calc(2.142857vw + 23.05714px);
  }

  @media ${breakPoints.smd} {
    height: calc(3.301886vw + 14.43396px);
  }

  @media ${breakPoints.sm} {
    height: 25px;
  }
`;

const GradientUpper = styled.div`
  position: absolute;
  top: -10%;
  height: calc(436 / 1080 * 100%);
  width: 100%;
  z-index: 50;

  background: linear-gradient(
    180deg,
    #121212 34.18%,
    rgba(18, 18, 18, 0.83) 54.72%,
    rgba(18, 18, 18, 0.345207) 77.1%,
    rgba(18, 18, 18, 0) 93.04%
  );
`;

const GradientLower = styled.div`
  position: absolute;
  bottom: calc(0% - 71 / 1080 * 100%);
  height: calc(436 / 1080 * 100%);
  width: 100%;
  z-index: 50;

  background: linear-gradient(
    180deg,
    #000000 23.39%,
    rgba(0, 0, 0, 0.72) 57.8%,
    rgba(0, 0, 0, 0) 91.74%
  );
  transform: matrix(1, 0, 0, -1, 0, 0);
`;

const Gradients = () => {
  return (
    <>
      <GradientUpper />
      <GradientLower />
    </>
  );
};

const RD = (): React.ReactElement => {
  const ref = useRef(null);

  return (
    <StyledWrapper ref={ref}>
      <Gradients />

      <MovingPicsGrid slantAngle={10} gammaAngle={120} speed={25} />

      <StyledContent>
        <div>
          <RDIcon as={litMagIcon} />

          <Text variant='h2_1_LJ' align='center'>
            Литжурнал
            <br />
            Русского Динозавра
          </Text>
        </div>

        <StyledMainText variant='text' align='left'>
          {string1}
          {s2}
          <a href='https://russiandino.ru/' target='_blank'>
            Русский&nbsp;Динозавр
          </a>
          {string3}
        </StyledMainText>

        <StyledSecondaryText variant='text' align='left'>
          Избранные рассказы попадают в&nbsp;ежегодник «
          <a
            href='https://chtivo.spb.ru/book-moguchij-russkij-dinozavr.html'
            target='_blank'
          >
            Могучий&nbsp;Русский Динозавр
          </a>
          ».
        </StyledSecondaryText>

        <StyledButton href='https://dzen.ru/russiandino' target='_blank'>
          Литжурнал Русского Динозавра
        </StyledButton>
      </StyledContent>
    </StyledWrapper>
  );
};

export default RD;
