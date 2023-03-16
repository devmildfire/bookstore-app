import React, { useRef } from 'react';
import styled from 'styled-components';
// import { useRef } from 'react';
// import styled from 'styled-components';
import Text from '@/components/Common/Text';
import Button from '@/components/Common/Button';
import {
  StyledContent,
  // StyledContentHeading,
  StyledMainText,
  // StyledMainPaddedText,
  // StyledRD,
  StyledSecondaryText,
  // StyledSecondaryPaddedText,
  StyledWrapper,
} from './styles';
import breakPoints from '@/utils/breakPoints';
// import litMagazineBack from '@/assets/images/litMagazineBack.png';
import litMagIcon from '@/assets/icons/litmagIcon.svg';
import MovingPicsGrid from '@/components/Common/MovingPicsGrid';
// import { string } from 'prop-types';

const StyledButton = styled(Button)`
  p {
    padding: 0;
  }
  /* min-width: 245px; */
  /* margin-top: 25px; */
  max-width: var(--box-width);
  width: calc(0.45 * var(--box-width));
  margin: 2% auto;

  max-height: 62px;
  min-height: 62px;
  /* min-width: 472px; */

  /* &:last-child {
    width: 480;
    align-self: flex-start;
    @media ${breakPoints.smd} {
      align-self: center;
    }
  } */
  @media ${breakPoints.xxl} {
    align-self: center;
    width: calc(0.6 * var(--box-width));
    max-height: 45px;
    min-height: 45px;
  }

  @media ${breakPoints.lg} {
    align-self: center;
    margin: 0.5% auto 2% auto;
    /* min-width: 300px; */
    max-height: 32px;
    min-height: 32px;
    width: calc(0.45 * var(--box-width));
  }

  @media ${breakPoints.md} {
    align-self: center;
    margin-right: auto;
    /* min-width: 287px; */
    max-height: 32px;
    min-height: 32px;
    width: calc(0.6 * var(--box-width));
  }

  @media ${breakPoints.smd} {
    align-self: center;
    margin-right: auto;
    /* min-width: 287px; */
    max-height: 32px;
    min-height: 32px;
    width: calc(0.7 * var(--box-width));
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
  /* transform-origin: center center; */
  /* 
  --logo-height: 70px; */

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
  top: 0%;
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
        <RDIcon as={litMagIcon as any} />

        <Text variant='h2_1_LJ' align='center'>
          Литжурнал
          <br />
          Русского Динозавра
        </Text>

        <StyledMainText variant='text' align='center'>
          {string1}
          {s2}
          {/* <a href='https://russiandino.ru/'>Русский&nbsp;Динозавр</a> */}
          <a href='https://russiandino.ru/'>Русский&nbsp;Динозавр</a>
          {string3}
        </StyledMainText>

        <StyledSecondaryText variant='text' align='center'>
          Лучшие рассказы года попадают в&nbsp;ежегодник «
          <a href='https://chtivo.spb.ru/book-moguchij-russkij-dinozavr.html'>
            Могучий&nbsp;Русский&nbsp;Динозавр
            {/* Могучий&nbsp;Русский&nbsp;Динозавр */}
          </a>
          ».
        </StyledSecondaryText>

        <StyledButton>Литжурнал Русского Динозавра</StyledButton>
      </StyledContent>
    </StyledWrapper>
  );
};

export default RD;
