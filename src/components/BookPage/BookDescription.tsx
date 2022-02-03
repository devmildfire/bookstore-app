import React from 'react';
import styled from 'styled-components';
import colors from '../../utils/colors';
import { TBookProps } from '../../types/bookProps';

const StyleWrapper = styled.div`
  margin-bottom: 200px;
  display: flex;
  justify-content: space-between;  
`;

const BookImage = styled.img`
  margin-right: 50px;
  width: 510px;
  height: 810px;
`;

const BookInfo = styled.div``;

const BookTitle = styled.h1`
  margin-bottom: 45px;
  font-family: Cheque;
  font-weight: 900;
  font-size: 80px;
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
      <BookInfo>
        <BookTitle>
          {title}
        </BookTitle>
        <BookAuthor>
          {author}
        </BookAuthor>
        <BookProps>
          {`${yearOfPublication} | ${genre} | ${ageRestriction}`}
        </BookProps>
        <BookThesis>
          ЕСЛИ ВЫ НЕ УСПЕЛИ ПОПРОЩАТЬСЯ С БАБУЛЕЙ,
          МЫ ПЕРЕДАДИМ ВАШЕ СООБЩЕНИЕ
        </BookThesis>
        <BookDescrText>
          {description.map((el: string) => (
            <p className='bookDescrParagraph'>
              {el}
            </p>
          ))}
        </BookDescrText>
      </BookInfo>
    </StyleWrapper>
  );
};

export default BookDescription;
