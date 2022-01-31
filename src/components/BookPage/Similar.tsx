import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import colors from '../../utils/colors';
import { TBookProps } from './Book';

const StyleWrapper = styled.div``;
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
const Book = styled.li``;
const BookLink = styled.a`
  cursor: pointer;
`;
const Banner = styled.img`
  width: 247px;
  height: 387px;
`;

const Similar = ({ book }: TBookProps): React.ReactElement => (
  <StyleWrapper>
    <Title>
      Познайте также
    </Title>
    <BooksList>
      <Book>
        <Link href='/'>
          <BookLink>
            <Banner
              src={book.banner}
              alt=''
            />
          </BookLink>
        </Link>
      </Book>
      <Book>
        <Link href='/'>
          <BookLink>
            <Banner
              src='/images/bookTitleDeleted.jpg'
              alt=''
            />
          </BookLink>
        </Link>
      </Book>
      <Book>
        <Link href='/'>
          <BookLink>
            <Banner
              src='/images/bookTitleDeleted.jpg'
              alt=''
            />
          </BookLink>
        </Link>
      </Book>
      <Book>
        <Link href='/'>
          <BookLink>
            <Banner
              src='/images/bookTitleDeleted.jpg'
              alt=''
            />
          </BookLink>
        </Link>
      </Book>
      <Book>
        <Link href='/'>
          <BookLink>
            <Banner
              src='/images/bookTitleDeleted.jpg'
              alt=''
            />
          </BookLink>
        </Link>
      </Book>
    </BooksList>
  </StyleWrapper>
);

export default Similar;
