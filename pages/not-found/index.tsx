import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
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

// filter: blur(10px);
const BookWormContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  padding: 5px;

  border-radius: calc(var(--radius) * 1);
  overflow: hidden;
`;

const UnblurContainer = styled.div`
  position: relative;
  width: 340px;
  height: 100px;
  transition: all 0.2s;
`;
const UnbluredDiv = styled.div`
  position: absolute;
  top: 5px;
  left: 5px;
  height: calc(100% - 5px);
  width: calc(100% - 5px);
  background-color: black;
`;

// filter: blur(10px);
const StyledCore = styled.div`
  --radius: 8px;

  ::before {
    --rotate: 0deg;
    --size: 400px;

    position: absolute;
    content: '';
    top: calc(50% - var(--size) / 2);
    left: calc(50% - var(--size) / 2);
    border-radius: 50%;
    height: var(--size);
    width: var(--size);
    background-image: conic-gradient(
      from var(--rotate),
      rgba(255, 0, 0, 0.4),
      rgba(255, 0, 0, 1),
      rgba(255, 0, 0, 0.4),
      rgba(255, 0, 0, 0.4),
      rgba(255, 0, 0, 1),
      rgba(255, 0, 0, 0.4),
      rgba(255, 0, 0, 0.4)
    );

    z-index: -2;
    animation: bg-spin 4s linear infinite;
    @keyframes bg-spin {
      to {
        transform: rotate(360deg);
      }
    }
  }

  ::after {
    position: absolute;
    content: '';
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: black;
    border-radius: var(--radius);
    z-index: -1;
  }

  position: relative;
  z-index: 333;
  width: 320px;
  height: 100px;

  @media ${breakPoints.sm} {
    max-width: 300px;
  }
`;

const StyledBookWorm = styled(BookWorm)`
  position: relative;
  z-index: 333;
  width: 100vw;
  filter: unset;
  max-width: 340px;

  @media ${breakPoints.sm} {
    max-width: 300px;
  }
`;

const EffectContainer = () => {
  const [visible, setVisible] = useState(false);

  return (
    <UnblurContainer
      className={`${visible ? 'scale-125' : 'scale-100'}`}
      onMouseOver={() => {
        setVisible(true);
      }}
      onMouseLeave={() => {
        setVisible(false);
      }}
    >
      <BookWormContainer className={`${visible ? 'visible' : 'invisible'}`}>
        <StyledCore></StyledCore>
      </BookWormContainer>

      <UnbluredDiv></UnbluredDiv>
    </UnblurContainer>
  );
};

function NotFoundPage() {
  return (
    <PageLayout headTitle='Страница не найдена'>
      <PageContainer>
        <Title variant='h1_Inv' align='center'>
          Любопытство — это хорошо, но придётся ещё немного подождать
        </Title>
        <StyledBookWorm className='worm' variant='red' />
        {/* <EffectContainer /> */}
        <Button href='/' variant='wide'>
          Вернуться на главную
        </Button>
      </PageContainer>
    </PageLayout>
  );
}
export default NotFoundPage;
