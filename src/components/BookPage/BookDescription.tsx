import React from 'react';
import styled from 'styled-components';
import colors from '../../utils/colors';
import { TBookProps } from '../../types/bookProps';

const StyleWrapper = styled.div`
  margin-bottom: 135px;
  display: flex;
  justify-content: space-between;  
`;

const BookImage = styled.img`
  margin-right: 50px;
  width: 510px;
  height: 810px;
`;

const BookTitle = styled.h1`
  margin-bottom: 45px;
  font-family: Cheque;
  font-weight: 900;
  font-size: 80px;
  line-height: 65%;
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

const BookInfo = styled.div`
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

const BookDescription = ({ book }: TBookProps): React.ReactElement => {
  const {
    title,
    author,
    yearOfPublication,
    genre,
    ageRestriction,
    link,
    description,
  } = book;

  return (
    <StyleWrapper>
      <BookImage
        src={link}
        alt={title}
      />
      <div>
        <BookTitle>
          {title}
        </BookTitle>
        <BookAuthor>
          {author}
        </BookAuthor>
        <BookInfo>
          {`${yearOfPublication} | ${genre} | ${ageRestriction}`}
        </BookInfo>
        <BookThesis>
          ЕСЛИ ВЫ НЕ УСПЕЛИ ПОПРОЩАТЬСЯ С БАБУЛЕЙ,
          МЫ ПЕРЕДАДИМ ВАШЕ СООБЩЕНИЕ
        </BookThesis>
        <BookDescrText>
          {description.map((paragraph: string) => (
            <p className='bookDescrParagraph'>
              {paragraph}
            </p>
          ))}
        </BookDescrText>
      </div>
    </StyleWrapper>
  );
};

export default BookDescription;
