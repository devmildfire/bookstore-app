import React from 'react';
import styled from 'styled-components';

const PageContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

const Title = styled.h1``;

function NotFoundPage() {
  return (
    <PageContainer>
      <Title>Любопытство это хорошо, но придётся ещё немного подождать</Title>
    </PageContainer>
  );
}
export default NotFoundPage;
