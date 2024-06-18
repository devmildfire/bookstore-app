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
import Head from 'next/head';

const BookPage = observer((): React.ReactElement => {
  const router = useRouter();
  const slug = router.query.slug;

  const adress = window.location + router.asPath;
  // console.log('adress ...', adress);

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
      <Head>
        <title>Белый цветок</title>
        <meta name='description' content={book.thesis} />

        {/* <meta
          property='og:url'
          content='https://mi59173.tw1.ru/books/Belyj-cvetok'
        /> */}
        <meta property='og:type' content='website' />
        {/* <meta property='og:title' content='Белыйф цветок' /> */}
        {/* <meta property='og:description' content='книга белый цветок описание' /> */}

        {/* <meta property='og:image' content={book.cover} /> */}

        {/* <meta
          property='og:image'
          content='https://api.mi59173.tw1.ru/storage/v1/object/public/titles/title_title_titles_Belyj-cvetok.jpg'
        /> */}
        {/* <meta
          property='og:image'
          content='https://ogcdn.net/e4b8c678-7bd5-445d-ba03-bfaad510c686/v4/mi59173.tw1.ru/%D0%91%D0%B5%D0%BB%D1%8B%D0%B9%D1%84%20%D1%86%D0%B2%D0%B5%D1%82%D0%BE%D0%BA/https%3A%2F%2Fopengraph.b-cdn.net%2Fproduction%2Fimages%2F56188dc2-e3c3-4ce5-a8b1-1323953e37b9.jpg%3Ftoken%3DhOY-wLL-tV2Wb6eqlpzb3hUOqYMZbXQ3az2flBDqaSs%26height%3D800%26width%3D1200%26expires%3D33251249770/og.png'
        /> */}

        <meta property='og:title' content={book.name} key='ogtitle' />
        <meta property='og:description' content={book.thesis} key='ogdesc' />

        <meta property='og:image' content={book.cover} key='ogimage' />
        <meta property='og:url' content={adress} key='ogurl' />
        <meta
          name='description'
          content={
            `официальная страница книги, ` +
            book.name +
            `, ` +
            authorsString +
            `, покупка, демо, информация`
          }
          key='description'
        />
        <meta
          name='keywords'
          content={
            book.name +
            `, ` +
            authorsString +
            `купить, читать, читать онлайн, скачать бесплатно, роман, книги, проза, новые книги, художественная литература, независимое издательство, инди книги`
          }
          key='keywords'
        />
      </Head>
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
