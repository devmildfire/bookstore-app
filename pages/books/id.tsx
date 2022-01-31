import React from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import colors from '../../src/utils/colors';
import Book from '../../src/components/BookPage/Book';
import Props from '../../src/components/BookPage/Props';
import Trailer from '../../src/components/BookPage/Trailer';
import Author from '../../src/components/BookPage/Author';
import Similar from '../../src/components/BookPage/Similar';

const StyleWrapper = styled.div`
  max-width: 1394px;
  padding: 30px 0 166px;
  margin: 0 auto;
  color: ${colors.whiteBase};
  
  .propsBtn {
    margin: 0;
    width: 300px;
    height: 70px;
    font-size: 16px;
    line-height: 20px;
  }
  
  .propsBtn:last-child {
    margin-bottom: 20px;
  }
`;

const BookPage = (): React.ReactElement => (
  <StyleWrapper>
    <Head>
      <title>DELETED</title>
    </Head>
    <Book />
    <Props />
    <Trailer />
    <Author />
    <Similar />
  </StyleWrapper>
);

export default BookPage;
