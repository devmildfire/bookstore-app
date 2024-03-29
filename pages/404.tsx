// import Hal9000 from '@/assets/images/HAL9000.svg';
import HallIcon from '@/assets/images/HAL9000_iconic_eye.svg';
import HalLogo from '@/assets/images/HALLOGO.svg';
import Button from '@/components/Common/Button';
import { Text } from '@/components/Common/Text/Text';
import PageLayout from '@/layouts/PageLayout';
import breakPoints from '@/utils/breakPoints';
import styled from 'styled-components';

// const HallIcon = styled.svg`
//   /* stroke: var(--main-white-100); */
//   margin: 0 auto;
//   /* height: 35vw; */
//   width: auto;
// `;

const HallDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  // gap: 2vh;
  /* justify-items: space-around; */
  /* height: 100%; */

  padding: 0 10vw;

  @media ${breakPoints.lg} {
    padding: 0 5vw;
  }
`;

const HalLogoStyled = styled(HalLogo)`
  width: 100%;
  /* max-width: 404px; */
  max-width: 200px;
  /* padding-bottom: 90px; */
  padding-bottom: 5px;

  @media ${breakPoints.lg} {
    /* padding-bottom: 70px; */
    /* padding-bottom: 10px; */
  }

  @media ${breakPoints.md} {
    /* padding-bottom: 20px; */
    /* padding-bottom: 10px; */
    /* max-width: 204px; */
    max-width: 122px;
  }
`;

const HallIconStyled = styled(HallIcon)`
  width: 100%;
  /* max-width: 550px; */
  max-width: 240px;

  @media ${breakPoints.md} {
    /* max-width: 250px; */
    max-width: 150px;
  }
`;

const StyledButton = styled(Button)`
  /* padding-top: 50px; */
  padding-top: 5px;

  @media ${breakPoints.md} {
    /* padding-top: 20px; */
    /* padding-top: 12px; */

    > button {
      max-width: 217px;
      min-width: 217px;

      > p {
        font-size: 10px;
      }
    }
  }
`;

const Hall = () => {
  return (
    <PageLayout headTitle='Страница не найдена'>
      <HallDiv>
        {/* <HallIcon as={Hal9000} /> */}
        <HallIconStyled />
        <HalLogoStyled />
        <Text variant='h2_1_HAL' align='center'>
          «Прости, Дэйв, боюсь,
          {/* I&apos;m sorry Dave, I&apos;m afraid I can&apos;t do that */}
        </Text>
        <Text variant='h2_1_HAL' align='center'>
          я не могу этого сделать»
          {/* I&apos;m sorry Dave, I&apos;m afraid I can&apos;t do that */}
        </Text>
        <StyledButton className='backButton' href='/' variant='wide'>
          {' '}
          Вернуться на главную{' '}
        </StyledButton>
      </HallDiv>
    </PageLayout>
  );
};

export default Hall;
