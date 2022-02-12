import React from 'react';
import styled from 'styled-components';
import { TBookProps } from '../../types/bookProps';

const StyleWrapper = styled.section`
  margin-bottom: 130px;
  
  @media screen and (max-width: 1024px) {
    margin-bottom: 100px;
  } 
  
  @media screen and (max-width: 576px) {
    margin-bottom: 70px;
  } 
`;

const Title = styled.h2`
  margin-bottom: 30px;
  text-align: center;
  font-family: Cheque;
  font-weight: 900;
  font-size: 57px;
  line-height: 68px;
  
  @media screen and (max-width: 1440px) {
    margin-bottom: 26px;
  } 
  
  @media screen and (max-width: 1024px) {
    margin-bottom: 30px;
    font-size: 40px;
    line-height: 48px;
  } 
  
  @media screen and (max-width: 576px) {
    font-size: 24px;
    line-height: 28px;
  } 
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
