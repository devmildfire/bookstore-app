import React, { useRef } from 'react';
import styled from 'styled-components';
import {
  useScroll,
  motion,
  useTransform,
  // useViewportScroll,
  // useMotionValueEvent,
} from 'framer-motion';
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
import litMagazineBack from '@/assets/images/litMagazineBack.png';
import litMagIcon from '@/assets/icons/litmagIcon.svg';
// import { string } from 'prop-types';

const StyledButton = styled(Button)`
  /* min-width: 245px; */
  /* margin-top: 25px; */
  margin: 5% auto;

  max-height: 62px;
  min-height: 62px;
  min-width: 472px;

  /* &:last-child {
    width: 480;
    align-self: flex-start;
    @media ${breakPoints.smd} {
      align-self: center;
    }
  } */

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
const string3 = ' — нашего творческого объединения мастеров арт-контента.';

const RDIcon = styled.svg`
  stroke: var(--main-white-100);
  margin: 0 auto;
  height: 97px;
  /* transform-origin: center center; */
  /* 
  --logo-height: 70px; */

  @media ${breakPoints.xl} {
    height: 80px;
  }

  @media ${breakPoints.lg} {
    height: 70px;
  }

  @media ${breakPoints.md} {
    height: 65px;
  }

  @media ${breakPoints.sm} {
    height: 50px;
  }
`;

// const RDLogo = () => {
//   return <img src={litMagIcon} alt='SVG logo' />;
// };

const RD = (): React.ReactElement => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['end start', 'start end'],
  });
  // const [hookedYPostion, setHookedYPosition] = React.useState(0);
  // React.useEffect(() => {
  //   scrollYProgress.onChange((v) => setHookedYPosition(v));
  // }, [scrollYProgress, setHookedYPosition]);

  const y = useTransform(scrollYProgress, [1, 0], ['-70%', '0%']);

  return (
    <StyledWrapper ref={ref}>
      <motion.img
        className='image'
        src={litMagazineBack.src}
        alt=''
        style={{ y }}
      />

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
          <a href='https://russiandino.ru/'>Русский&nbsp;Динозавр</a>
          {string3}
        </StyledMainText>
        <StyledSecondaryText variant='text' align='center'>
          Лучшие рассказы года попадают в&nbsp;ежегодник «
          <a href='https://chtivo.spb.ru/book-moguchij-russkij-dinozavr.html'>
            Могучий&nbsp;Русский&nbsp;Динозавр
          </a>
          ».
        </StyledSecondaryText>
        <StyledButton>Литжурнал Русского Динозавра</StyledButton>
      </StyledContent>
    </StyledWrapper>
  );
};

export default RD;
