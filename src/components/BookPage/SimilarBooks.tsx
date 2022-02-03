import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import booksData from '../../utils/booksData';

const Title = styled.h2`
  margin-bottom: 50px;
  text-align: center;
  font-family: Cheque;
  font-style: normal;
  font-weight: 900;
  font-size: 44px;
  line-height: 53px;
`;

const BooksList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  justify-content:space-between;
`;

const BookItem = styled.li`
  flex: 0 0 18.5%;  
`;
const BookLink = styled.a`
  cursor: pointer;
`;
const Banner = styled.img`
  width: 100%;
  height: 387px;
`;

const SimilarBooks = (): React.ReactElement => (
  <div>
    <Title>
      Познайте также
    </Title>
    <BooksList>
      {booksData.map((book, index) => {
        if (index < 5) {
          return (
            <BookItem>
              <Link href={`/books/${book.id}`}>
                <BookLink>
                  <Banner
                    src={book.link}
                    alt={book.title}
                  />
                </BookLink>
              </Link>
            </BookItem>
          );
        }
        return null;
      })}
    </BooksList>
  </div>
);

export default SimilarBooks;
