/* eslint-disable operator-linebreak */
import React from 'react';
import styled from 'styled-components';
import BookDescription from '@/components/BookPage/BookDescription';
import BookProperties from '@/components/BookPage/BookProperties';
import BookTrailer from '@/components/BookPage/BookTrailer';
import BookAuthor from '@/components/BookPage/BookAuthor';
import breakPoints from '@/utils/breakPoints';
import PageLayout from '@/layouts/PageLayout';
import { observer } from 'mobx-react-lite';
import { titlesStore } from '@/store/locals/dashboard/TitlesStore/TitlesStore';
import { useRouter } from 'next/router';
import { extendTitles } from '..';

const BookPage = observer((): React.ReactElement => {
  const router = useRouter();
  const slug = router.query.slug;

  const booksFromSlug =
    titlesStore?.titles?.filter((title) => title.slug === slug) || [];

  const book = extendTitles(booksFromSlug)[0] || null;

  if (!book) return <p>Не удалось загрузить страницу книги</p>;

  const authorsString = book.authors.map((author) => author.name).join(', ');

  return (
    <PageLayout
      headTitle={
        book.name + ` | ` + authorsString + ` | ` + `Официальная страница книги`
      }
    >
      <StyleWrapper className='max-width'>
        <BookDescription {...book} />
        <BookProperties {...book} />

        {book.trailer && (
          <BookTrailer
            src={book.trailer}
            title={book.name}
            poster={book.trailerPoster}
          />
        )}

        <BookAuthor authors={book.authors} />
        {/* <SimilarBooks /> */}
      </StyleWrapper>
    </PageLayout>
  );
});

const StyleWrapper = styled.div`
  position: relative;
  display: grid;
  justify-content: center;
  gap: 170px;
  @media ${breakPoints.lg} {
    gap: 48px;
  }
  @media screen and (max-width: 576px) {
    gap: 48px;
  }
`;

export default BookPage;
