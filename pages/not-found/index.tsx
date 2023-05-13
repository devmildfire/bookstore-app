import React from 'react';
import Image from 'next/image';
import styled from 'styled-components';
import Text from '@/components/Common/Text';
import breakPoints from '@/utils/breakPoints';
import Button from '@/components/Common/Button';
import bookWorm from '@/assets/images/preloader_animation.gif';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 100%;
  height: 100%;
  align-items: center;

  gap: 20px;
`;

// const Title = styled.h1``;

const Title = styled(Text)`
  padding: 0 10vw;
  /* font-size: 80px; */

  @media screen and (max-width: 1600px) {
    /* font-size: 50px; */
  }

  @media ${breakPoints.xl} {
    /* font-size: 50px; */
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

const BookWorm = styled(Image)`
  width: 175px;

  @media screen and (max-width: 1600px) {
  }

  @media ${breakPoints.xl} {
  }

  @media screen and (max-width: 1200px) {
  }

  @media ${breakPoints.lg} {
  }

  @media ${breakPoints.md} {
    /* max-width: 80vw; */
  }

  @media ${breakPoints.smd} {
  }

  @media ${breakPoints.sm} {
  }
`;

function NotFoundPage() {
  return (
    <PageContainer>
      <Title variant='h1_Inv' align='center'>
        Любопытство — это хорошо, но придётся ещё немного подождать
      </Title>
      <BookWorm alt='bookworm' src={bookWorm} />
      <Button href='/' variant='wide'>
        {' '}
        Вернуться на главную{' '}
      </Button>
    </PageContainer>
  );
}
export default NotFoundPage;
