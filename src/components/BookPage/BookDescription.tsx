import React from 'react';
import styled from 'styled-components';
import colors from '../../utils/colors';
import { TBookProps } from '../../types/bookProps';

const StyleWrapper = styled.section`
  margin-bottom: 135px;
  display: flex;
  justify-content: space-between;  
  
  @media screen and (max-width: 830px) {
    margin-bottom: 70px;
  } 
  
  @media screen and (max-width: 576px) {
    flex-direction: column;
    align-items: center;
  }
`;

const BookImage = styled.img`
  margin-right: 50px;
  width: 510px;
  height: 810px;
  
  @media screen and (max-width: 1440px) {
    width: 485px;
    height: 740px;
  } 
  
  @media screen and (max-width: 1024px) {
    width: 312px;
    height: 480px;
  }
  
  @media screen and (max-width: 830px) {
    width: 260px;
    height: 365px;
    margin-right: 20px;
  }
  
  @media screen and (max-width: 576px) {
    margin-right: 0;
    margin-bottom: 20px;    
  }
`;

const BookTitle = styled.h1`
  margin-bottom: 45px;
  font-family: Cheque;
  font-weight: 900;
  font-size: 80px;
  line-height: 65%;
  color: ${colors.gray5};
  
  @media screen and (max-width: 1440px) {
    margin-bottom: 57px;
    font-size: 60px;
  } 
  
  @media screen and (max-width: 1024px) {
    margin-bottom: 45px;
  }
  
  @media screen and (max-width: 830px) {
    margin-bottom: 15px;
    font-size: 24px;
    line-height: 29px;
  }
  
  @media screen and (max-width: 576px) {
    text-align: center;
  }
`;

const BookAuthor = styled.div`
  margin-bottom: 10px;
  font-weight: bold;
  font-size: 30px;
  line-height: 37px;
  
  @media screen and (max-width: 1024px) {
    font-size: 20px;
    line-height: 24px;
  }  
  
  @media screen and (max-width: 576px) {
    text-align: center;
    margin-bottom: 5px;
  } 
`;

const BookThesis = styled.div`
  margin-bottom: 95px;
  font-style: italic;
  font-weight: 500;
  font-size: 28px;
  line-height: 34px;
  color: ${colors.red};
  
  @media screen and (max-width: 1440px) {
    margin-bottom: 23px;
    font-size: 24px;
    line-height: 29px;
  } 
  
  @media screen and (max-width: 1024px) {
    margin-bottom: 17px;
    font-size: 18px;
    line-height: 22px;
  }
  
  @media screen and (max-width: 830px) {
    font-size: 14px;
    line-height: 17px;
  } 
`;

const BookInfo = styled.div`
  margin-bottom: 129px;
  font-weight: 700;
  font-size: 14px;
  line-height: 17px;
  
  @media screen and (max-width: 1440px) {
    margin-bottom: 45px;
  } 
  
  @media screen and (max-width: 830px) {
    margin-bottom: 25px;
  } 
  
  @media screen and (max-width: 576px) {
    text-align: center;
    margin-bottom: 30px;
  } 
`;

const BookDescrText = styled.div`
  max-width: 700px;
  font-size: 24px;
  line-height: 29px;
  
  .bookDescrParagraph:not(last-child) {
    margin-bottom: 20px;    
    
    @media screen and (max-width: 1440px) {
      margin-bottom: 10px;
    } 
  }
  
  @media screen and (max-width: 1024px) {
    max-width: 474px;
    font-size: 16px;
    line-height: 19.5px;
  }
  
  @media screen and (max-width: 830px) {
    
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
