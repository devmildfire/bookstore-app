import Hall9000 from '@/assets/images/HAL9000.svg';
import Button from '@/components/Common/Button';
import { Text } from '@/components/Common/Text/Text';
import breakPoints from '@/utils/breakPoints';
import styled from 'styled-components';

const HallIcon = styled.svg`
  /* stroke: var(--main-white-100); */
  margin: 0 auto;
  /* height: 35vw; */
  width: auto;
`;

const HallDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5vh;
  /* justify-items: space-around; */
  /* height: 100%; */

  padding: 10vw;

  @media ${breakPoints.lg} {
    padding: 5vw;
  }
`;

const Hall = () => {
  return (
    <HallDiv>
      <HallIcon as={Hall9000} />
      <Text variant='h3_1Man' align='center'>
        I&apos;m sorry Dave, I&apos;m afraid I can&apos;t do that
      </Text>
      <Button href='/'> Вернуться на главную </Button>
    </HallDiv>
  );
};

export default Hall;
