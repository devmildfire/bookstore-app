import React from 'react';
import styled from 'styled-components';
import { TBookProps } from '../../types/bookProps';

const StyleWrapper = styled.section`
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

const TrailerContainer = styled.div`
  position:relative;
  width: 100%;
  padding-top: 56.25%;
`;

const TrailerVideo = styled.iframe`
  position:absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;  
  width: 100%;
  height: 100%;
`;

const BookTrailer = ({ book }: TBookProps): React.ReactElement => (
  <StyleWrapper>
    <Title>
      Буктрейлер
    </Title>
    <TrailerContainer>
      <TrailerVideo
        src={book.trailerSrc}
        title={book.title}
        frameBorder='0'
        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
        allowFullScreen
      />
    </TrailerContainer>
  </StyleWrapper>
);

export default BookTrailer;
