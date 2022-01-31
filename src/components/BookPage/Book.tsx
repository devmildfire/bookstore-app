import React from 'react';
import styled from "styled-components";
import colors from "../../utils/colors";

const StyleWrapper = styled.div`
  margin-bottom: 200px;
  display: flex;
  justify-content: space-between;  
`;

const BookImage = styled.img`
  margin-right: 50px;
`;

const BookInfo = styled.div``;

const BookTitle = styled.h1`
  margin-bottom: 45px;
  font-family: Cheque;
  font-weight: 900;
  font-size: 80px;
  line-height: 62.5%;
  color: ${colors.gray5};
`;

const BookAuthor = styled.div`
  margin-bottom: 10px;
  font-weight: bold;
  font-size: 30px;
  line-height: 37px;
`;

const BookThesis = styled.div`
  margin-bottom: 95px;
  font-style: italic;
  font-weight: 500;
  font-size: 28px;
  line-height: 34px;
  color: ${colors.red};
`;

const BookProps = styled.div`
  margin-bottom: 129px;
  font-weight: 700;
  font-size: 14px;
  line-height: 17px;
`;

const BookDescrText = styled.div`
  font-size: 24px;
  line-height: 29px;
  
  .bookDescrParagraph:not(last-child) {
    margin-bottom: 20px;
    max-width: 700px;
  }
`;

const Book = (): React.ReactElement => (
  <StyleWrapper>
    <BookImage
      src='/images/bookTitleDeleted_BookPage.jpg'
      alt='Book logo'
    />
    <BookInfo>
      <BookTitle>
        DELETED
      </BookTitle>
      <BookAuthor>
        Катерина Кюне
      </BookAuthor>
      <BookProps>
        2021 | роман |18+
      </BookProps>
      <BookThesis>
        ЕСЛИ ВЫ НЕ УСПЕЛИ ПОПРОЩАТЬСЯ С БАБУЛЕЙ,
        МЫ ПЕРЕДАДИМ ВАШЕ СООБЩЕНИЕ
      </BookThesis>
      <BookDescrText>
        <p className='bookDescrParagraph'>
          Стася работает бардонавткой,
          кем-то вроде почтальона между нашим миром и
          Бардо — так учёные назвали случайно открытое измерение,
          куда на некоторое время после смерти попадает сознание умерших людей.
        </p>
        <p className='bookDescrParagraph'>
          Стася хорошо себя чувствует среди мёртвых,
          а вот в мире живых у неё полно проблем: письма и слежка бывшего парня,
          постоянные разговоры отца о её никчёмности…
        </p>
        <p className='bookDescrParagraph'>
          Но всего этого как будто недостаточно,
          и в её жизни появляется ещё один преследователь — невидимый.
        </p>
      </BookDescrText>
    </BookInfo>
  </StyleWrapper>
);

export default Book;
