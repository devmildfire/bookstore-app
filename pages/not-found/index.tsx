import React from 'react';
import styled from 'styled-components';
import Text from '@/components/Common/Text';
import breakPoints from '@/utils/breakPoints';
import Button from '@/components/Common/Button';
import Book from '@/assets/icons/book_for_animation.svg';

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

interface BookWormProps {
  readonly className: string;
}

const BookWorm = (props: BookWormProps): React.ReactElement => (
  <div className={props.className}>
    <BookStyled variant='up' />
    <BookStyled variant='down' />
    <BookStyled variant='up' />
    <BookStyled variant='down' />
    <BookStyled variant='up' />
  </div>
);

const StyledBookWorm = styled(BookWorm)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 80vw;
  aspect-ratio: 5;
  max-width: 620px;
  gap: 1%;

  --delay-unit: 0.5s;

  svg {
    animation: pulse calc(var(--delay-unit) * 10) infinite;
  }

  @keyframes pulse {
    0% {
      color: white;
    }
    49% {
      color: white;
    }
    50% {
      /* color: var(--main-black); */
      color: var(--main-red-100);
    }
    100% {
      /* color: var(--main-black); */
      color: var(--main-red-100);
    }
  }

  svg:nth-child(2) {
    animation-delay: var(--delay-unit);
  }

  svg:nth-child(3) {
    animation-delay: calc(var(--delay-unit) * 2);
  }

  svg:nth-child(4) {
    animation-delay: calc(var(--delay-unit) * 3);
  }

  svg:nth-child(5) {
    animation-delay: calc(var(--delay-unit) * 4);
  }
`;

const BookStyled = styled(Book)<{ variant?: string }>`
  width: 100%;

  color: var(--main-black);
  /* color: var(--main-red-100); */

  transform: ${(props) =>
    props.variant === 'down' && 'translate(0, -44%) rotate(180deg)'};
`;

function NotFoundPage() {
  return (
    <PageContainer>
      <Title variant='h1_Inv' align='center'>
        Любопытство — это хорошо, но придётся ещё немного подождать
      </Title>
      <StyledBookWorm className='worm' />
      <Button href='/' variant='wide'>
        Вернуться на главную
      </Button>
    </PageContainer>
  );
}
export default NotFoundPage;
