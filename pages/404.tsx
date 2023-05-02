import Hall9000 from '@/assets/images/HAL9000.svg';
import { Text } from '@/components/Common/Text/Text';
import styled from 'styled-components';

const HallIcon = styled.svg`
  /* stroke: var(--main-white-100); */
  margin: 0 auto;
  /* height: 35vw; */
  width: auto;
`;

const Hall = () => {
  return (
    <>
      <HallIcon as={Hall9000} />
      <Text variant='h3_1Man' align='center'>
        I&apos;m sorry Dave, I&apos;m afraid I can&apos;t do that
      </Text>
    </>
  );
};

export default Hall;
