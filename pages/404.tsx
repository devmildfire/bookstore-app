// import Hal9000 from '@/assets/images/HAL9000.svg';
import HallIcon from '@/assets/images/HAL9000_iconic_eye.svg';
import HalLogo from '@/assets/images/HALLOGO.svg';
import Button from '@/components/Common/Button';
import { Text } from '@/components/Common/Text/Text';
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
  gap: 2vh;
  /* justify-items: space-around; */
  /* height: 100%; */

  padding: 0 10vw;

  @media ${breakPoints.lg} {
    padding: 0 5vw;
  }
`;

const HalLogoStyled = styled(HalLogo)`
  max-width: 404px;
`;

const HallIconStyled = styled(HallIcon)`
  width: 100%;
  max-width: 485px;
`;

const Hall = () => {
  return (
    <HallDiv>
      {/* <HallIcon as={Hal9000} /> */}
      <HallIconStyled />
      <HalLogoStyled />
      <Text variant='h2_1' align='center'>
        «Прости, Дэйв, боюсь, я не могу этого сделать»
        {/* I&apos;m sorry Dave, I&apos;m afraid I can&apos;t do that */}
      </Text>
      <Button href='/' variant='wide'>
        {' '}
        Вернуться на главную{' '}
      </Button>
    </HallDiv>
  );
};

export default Hall;
