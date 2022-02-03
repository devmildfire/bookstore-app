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

const TrailerVideo = styled.iframe`
  width: 100%;
  height: 472px;
`;

const BookTrailer = (): React.ReactElement => (
  <StyleWrapper>
    <Title>
      Буктрейлер
    </Title>
    <TrailerVideo
      src='https://www.youtube.com/embed/RbE7vmnkWvU'
      title='YouTube video player'
      frameBorder='0'
      allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
      allowFullScreen
    />
  </StyleWrapper>
);

export default BookTrailer;
