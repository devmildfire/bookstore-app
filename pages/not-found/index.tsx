import React from 'react';
import styled from 'styled-components';
import Text from '@/components/Common/Text';
import breakPoints from '@/utils/breakPoints';
import Button from '@/components/Common/Button';
import BookWorm from '@/components/Common/BookWormLoader';
import PageLayout from '@/layouts/PageLayout';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 100%;
  height: 100%;
  align-items: center;

  gap: 6vh;
`;

const Title = styled(Text)`
  padding: 0 25vw;
  /* font-size: 80px; */

  @media screen and (max-width: 1850px) {
    /* font-size: 50px; */
    padding: 0 20vw;
  }

  @media screen and (max-width: 1600px) {
    /* font-size: 50px; */
    padding: 0 20vw;
  }

  @media ${breakPoints.xl} {
    /* font-size: 50px; */
    padding: 0 15vw;
  }

  @media screen and (max-width: 1200px) {
    /* font-size: 40px; */
  }

  @media ${breakPoints.lg} {
    /* font-size: 40px; */
    padding: 0 5vw;
  }

  @media ${breakPoints.md} {
    /* font-size: 20px; */
  }

  @media ${breakPoints.smd} {
    /* font-size: 20px; */
  }

  @media ${breakPoints.sm} {
    /* font-size: 20px; */
  }
`;

const StyledBookWorm = styled(BookWorm)`
  width: 100vw;

  max-width: 340px;

  @media ${breakPoints.sm} {
    max-width: 300px;
  }
`;

function NotFoundPage() {
  return (
    <PageLayout headTitle='Страница не найдена'>
      <PageContainer>
        <Title variant='h1_Inv' align='center'>
          Любопытство — это хорошо, но придётся ещё немного подождать
        </Title>
        <StyledBookWorm className='worm' variant='red' />
        <Button href='/' variant='wide'>
          Вернуться на главную
        </Button>
      </PageContainer>
    </PageLayout>
  );
}
export default NotFoundPage;
