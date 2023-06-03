import React from 'react';
// import Image from 'next/image';
import styled from 'styled-components';
import Text from '@/components/Common/Text';
import breakPoints from '@/utils/breakPoints';
import Button from '@/components/Common/Button';
// import bookWorm from '@/assets/images/preloader_animation.gif';

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

const HalfBook = styled.div<{ $variant: string }>`
  background-color: currentColor;
  height: 100%;
  width: 100%;

  transform: ${(props) => {
    if (props.$variant === 'up') {
      return 'skewY(30deg)';
    }
    if (props.$variant === 'down') {
      return 'skewY(-30deg)';
    }
  }};
`;

interface BookProps {
  readonly className: string;
  variant: string;
}

function Book(props: BookProps): React.ReactElement {
  let halves = <div></div>;
  props.variant === 'up' &&
    (halves = (
      <div className={props.className}>
        <HalfBook $variant='up' />
        <HalfBook $variant='down' />
      </div>
    ));
  props.variant === 'down' &&
    (halves = (
      <div className={props.className}>
        <HalfBook $variant='down' />
        <HalfBook $variant='up' />
      </div>
    ));

  return halves;
}

const StyledBook = styled(Book)`
  display: flex;
  width: 100%;
  height: 60%;

  align-items: center;
  justify-content: space-around;
  transform: ${(props) => props.variant === 'up' && 'translate(0, 48%)'};
`;

// const BookWorm = styled(Image)`
//   /* width: 175px; */
//   max-height: 135px;
//   width: auto;

//   @media screen and (max-width: 1600px) {
//   }

//   @media ${breakPoints.xl} {
//   }

//   @media screen and (max-width: 1200px) {
//   }

//   @media ${breakPoints.lg} {
//   }

//   @media ${breakPoints.md} {
//     /* max-width: 80vw; */
//   }

//   @media ${breakPoints.smd} {
//   }

//   @media ${breakPoints.sm} {
//   }
// `;

interface HyperBookWormProps {
  readonly className: string;
}

const HyperBookWorm = (props: HyperBookWormProps): React.ReactElement => (
  <div className={props.className}>
    <StyledBook variant='up' className='bookClass' />
    <StyledBook variant='down' className='bookClass' />
    <StyledBook variant='up' className='bookClass' />
    <StyledBook variant='down' className='bookClass' />
    <StyledBook variant='up' className='bookClass' />
  </div>
);

const Styledh = styled(HyperBookWorm)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 80vw;
  aspect-ratio: 5;
  max-width: 620px;
  gap: 1%;

  --delay-unit: 0.5s;

  .bookClass {
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

  .bookClass:nth-child(2) {
    animation-delay: var(--delay-unit);
  }

  .bookClass:nth-child(3) {
    animation-delay: calc(var(--delay-unit) * 2);
  }

  .bookClass:nth-child(4) {
    animation-delay: calc(var(--delay-unit) * 3);
  }

  .bookClass:nth-child(5) {
    animation-delay: calc(var(--delay-unit) * 4);
  }
`;

function NotFoundPage() {
  return (
    <PageContainer>
      <Title variant='h1_Inv' align='center'>
        {/* Любопытство — это хорошо, но придётся ещё немного подождать */}
        Любопытство — это хорошо, но придётся ещё немного подождать
      </Title>
      {/* <BookWorm alt='bookworm' src={bookWorm} /> */}
      <Styledh className='worm' />
      <Button href='/' variant='wide'>
        {' '}
        Вернуться на главную{' '}
      </Button>
    </PageContainer>
  );
}
export default NotFoundPage;
