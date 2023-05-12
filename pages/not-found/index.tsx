import React from 'react';
import styled from 'styled-components';
import Text from '@/components/Common/Text';
import breakPoints from '@/utils/breakPoints';

const PageContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

// const Title = styled.h1``;

const Title = styled(Text)`
  padding: 0 10vw;
  font-size: 80px;

  @media screen and (max-width: 1600px) {
    font-size: 50px;
  }

  @media ${breakPoints.xl} {
    font-size: 50px;
  }

  @media screen and (max-width: 1200px) {
    font-size: 40px;
  }

  @media ${breakPoints.lg} {
    font-size: 40px;
    padding: 0 5vw;
  }

  @media ${breakPoints.md} {
    font-size: 20px;
  }

  @media ${breakPoints.smd} {
    font-size: 20px;
  }

  @media ${breakPoints.sm} {
    font-size: 20px;
  }
`;

function NotFoundPage() {
  return (
    <PageContainer>
      <Title variant='h1' align='center'>
        Любопытство — это хорошо, но придётся ещё немного подождать
      </Title>
    </PageContainer>
  );
}
export default NotFoundPage;
