import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import styled from 'styled-components';
import { BookCardProps } from '../../src/components/BookCard';

const BookPage = (): React.ReactElement => {
    // const {
    //     title,
    //     link,
    //     author,
    //     yearOfPublication,
    //     genre,
    //     ageRestriction,
    //     description,
    // } = book;
    // const parsedDescription = description
    //     .map((paragraph) => <p className='descriptionParagraph'>{paragraph}</p>);

    return (
  <StyleWrapper>
      <Head>
          <title>DELETED</title>
      </Head>
      <div className="bookCard">
          <img
              className="bookImage"
              src='../../public/images/bookTitleDeleted.jpg'
              alt="Book logo"
          />
          <div className="bookInfo">
              <h1>
                  DELETED
              </h1>
              <div className="bookAuthor">
                  Катерина Кюне
              </div>
              <div className="bookDescr">
                  2021 | роман |18+
              </div>
              <div className="bookThesis">
                  ЕСЛИ ВЫ НЕ УСПЕЛИ ПОПРОЩАТЬСЯ С БАБУЛЕЙ,
                  МЫ ПЕРЕДАДИМ ВАШЕ СООБЩЕНИЕ
              </div>
              <div className="bookDescrText">
                  <p>
                      Стася работает бардонавткой, кем-то вроде почтальона между нашим миром и Бардо — так учёные назвали случайно открытое измерение, куда на некоторое время после смерти попадает сознание умерших людей.
                  </p>
                  <p>
                      Стася хорошо себя чувствует среди мёртвых, а вот в мире живых у неё полно проблем: письма и слежка бывшего парня, постоянные разговоры отца о её никчёмности…
                  </p>
                  <p>
                      Но всего этого как будто недостаточно, и в её жизни появляется ещё один преследователь — невидимый.
                  </p>
              </div>
          </div>
          <div className="props">
            <div className="propsHeader">
                <h2 className="propsTitle">
                    ЦИФРОВОЕ ИЗДАНИЕ
                </h2>
                <div className="propsPrice">
                    300₽
                </div>
                <div className="propsDate">
                    Дата релиза: дд.мм.гггг
                </div>
            </div>
          </div>
      </div>
  </StyleWrapper>
)};

export default BookPage;

const StyleWrapper = styled.div`

`
