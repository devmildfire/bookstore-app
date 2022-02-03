import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import colors from '../../utils/colors';

const Title = styled.h2`
  margin-bottom: 50px;
  text-align: center;
  font-family: Cheque;
  font-style: normal;
  font-weight: 900;
  font-size: 44px;
  line-height: 53px;
  color: ${colors.red};
`;
const BooksList = styled.ul`
  display: flex;
  justify-content:space-between;
`;
const BookItem = styled.li``;
const BookLink = styled.a`
  cursor: pointer;
`;
const Banner = styled.img`
  width: 247px;
  height: 387px;
`;

const SimilarBooks = (): React.ReactElement => (
  <div>
    <Title>
      Познайте также
    </Title>
    <BooksList>
      <BookItem>
        <Link href='/'>
          <BookLink>
            <Banner
              src='/images/bookTitleDeleted.jpg'
              alt=''
            />
          </BookLink>
        </Link>
      </BookItem>
      <BookItem>
        <Link href='/'>
          <BookLink>
            <Banner
              src='/images/bookTitleDeleted.jpg'
              alt=''
            />
          </BookLink>
        </Link>
      </BookItem>
      <BookItem>
        <Link href='/'>
          <BookLink>
            <Banner
              src='/images/bookTitleDeleted.jpg'
              alt=''
            />
          </BookLink>
        </Link>
      </BookItem>
      <BookItem>
        <Link href='/'>
          <BookLink>
            <Banner
              src='/images/bookTitleDeleted.jpg'
              alt=''
            />
          </BookLink>
        </Link>
      </BookItem>
      <BookItem>
        <Link href='/'>
          <BookLink>
            <Banner
              src='/images/bookTitleDeleted.jpg'
              alt=''
            />
          </BookLink>
        </Link>
      </BookItem>
    </BooksList>
  </div>
);

export default SimilarBooks;
