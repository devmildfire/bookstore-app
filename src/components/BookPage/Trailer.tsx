import React from 'react';
import styled from 'styled-components';

const StyleWrapper = styled.div`
  margin-bottom: 200px;
`;

const Title = styled.h2`
  margin-bottom: 30px;
  text-align: center;
  font-family: Cheque;
  font-weight: 900;
  font-size: 57px;
  line-height: 68px;
`;

const TrailerVideo = styled.img``;

const Trailer = () => (
  <StyleWrapper>
    <Title>
      Буктрейлер
    </Title>
    <TrailerVideo
      src='/images/trailerScreenShot.png'
      alt='Trailer'
    />
  </StyleWrapper>
);

export default Trailer;
