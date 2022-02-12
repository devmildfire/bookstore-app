import React, { ReactElement } from 'react';
import { ReactSVG } from 'react-svg';
import styled from 'styled-components';
import { TBookProps } from '../../types/bookProps';
import colors from '../../utils/colors';
import contactIconsSrc from '../../utils/contactIconsData';

const StyleWrapper = styled.section`
  margin-bottom: 105px;
  
  @media screen and (max-width: 576px) {
    margin-bottom: 70px;
  } 
`;

const Title = styled.h2`
  margin-bottom: 30px;
  text-align: center;
  font-family: Cheque;
  font-weight: 900;
  font-size: 57px;
  line-height: 68px;
  
  @media screen and (max-width: 1440px) {
    margin-bottom: 26px;
  } 
  
  @media screen and (max-width: 1024px) {
    font-size: 40px;
    line-height: 48px;
  } 
  
  @media screen and (max-width: 576px) {
    margin-bottom: 30px;
    font-size: 24px;
    line-height: 28px;
  } 
`;

const AuthorInfo = styled.div`
  position: relative;
  margin-bottom: 40px;
  display: flex;
  
  @media screen and (max-width: 1024px) {
    margin-bottom: 20px;
  } 
  
  @media screen and (max-width: 830px) {
    flex-direction: column;
    align-items: center;
  } 
  
  @media screen and (max-width: 576px) {
    margin-bottom: 10px;
  }
`;

const AuthorFoto = styled.img`
  margin-right: 40px;
  
  @media screen and (max-width: 1440px) {
    width: 416px;
    height: 294px;
  }
  
  @media screen and (max-width: 830px) {
    margin-right: 0;
    margin-bottom: 20px;
  }
  
  @media screen and (max-width: 576px) {
    width: 288px;
    height: 200px;
  } 
`;

const AuthorDescr = styled.div`
  font-size: 24px;
  line-height: 29px;  
`;

const AuthorProps = styled.div`
  margin-bottom: 40px;
  font-weight: 700; 
  
  @media screen and (max-width: 1440px) {
    margin-bottom: 25px;
  } 
  
  @media screen and (max-width: 1024px) {
    margin-bottom: 19px;
    font-size: 18px;
    line-height: 22px;
  } 
  
  @media screen and (max-width: 576px) {
    margin-bottom: 15px;
    font-size: 16px;
    line-height: 20px;
    font-weight: 400;
    
    & span {
      display: block;
      margin-top: 5px;
    }
  }
`;

const AuthorSpeech = styled.p`
  position: relative;
  max-width: 661px;
  font-style: italic;
  font-weight: 400;
  
  @media screen and (max-width: 1440px) {
    max-width: 558px;
    font-size: 20px;
    line-height: 24px;
  } 
  
  @media screen and (max-width: 1024px) {
    max-width: 406px;
    font-size: 16px;
    line-height: 19.5px;
  } 
  
  @media screen and (max-width: 830px) {
    font-size: 15px;
  } 
`;

const Quotes = styled.span`
  @media screen and (min-width: 960px) {
    display: none;
  } 
`;

const RedQuote = styled.span`
  position: absolute;
  right: -126px;
  top: -40px;
  font-style: italic;
  font-weight: 500;
  font-size: 105px;
  line-height: 128px;
  color: ${colors.red};
  
  @media screen and (max-width: 1440px) {
    top: -30px;
    right: -43px;
    font-size: 65px;
    line-height: 80px;
  }
  
  @media screen and (max-width: 1100px) {
    right: -8px;
  }
  
  @media screen and (max-width: 1024px) {
    right: -58px;
    font-size: 51px;
    line-height: 62px;
  }
  
  @media screen and (max-width: 960px) {
    display: none;
  }
`;

const AuthorAbout = styled.p`
  margin-bottom: 54px;
  font-size: 24px;
  line-height: 29px;
  
  @media screen and (max-width: 1440px) {
    margin-bottom: 33px;
  } 
  
  @media screen and (max-width: 1024px) {
    font-size: 16px;
    line-height: 19.5px;
  } 
  
  @media screen and (max-width: 576px) {
    margin-bottom: 22px;
  } 
`;

const AuthorContacts = styled.div`
  display: flex;
  justify-content:center;
  font-size: 18px;
  line-height: 22px;
  
  span {
    margin-right: 25px;
    font-weight: 700;
    
    @media screen and (max-width: 576px) {
      font-size: 16px;
      line-height: 19.5px;
    } 
  }
  
  @media screen and (max-width: 576px) {
    & svg {
      width: 16.67px;
      height: 13.33px;
    }
  } 
`;

const ContactsList = styled.ul`
  display: flex;
  align-items: center;
`;

const ContactsItem = styled.li`
  &:not(:last-child) {
    margin-right: 30px;
    
    @media screen and (max-width: 576px) {
      margin-right: 21px;
    }
  }   
`;

const ContactLink = styled.a`
  & svg path {
    transition: fill .3s ease-in-out;
  }
  
  &:hover svg path {
    fill: ${colors.redBase};
    transition: fill .3s ease-in-out;
  }
`;

const BookAuthor = ({ book }: TBookProps): ReactElement => (
  <StyleWrapper>
    <Title>
      Об авторе
    </Title>
    <AuthorInfo>
      <AuthorFoto
        src='/images/authors/kune.jpg'
        alt={`${book.author}`}
      />
      <AuthorDescr>
        <AuthorProps>
          {book.author
          && (
            <span>
              {`${book.author} `}
            </span>
          )}
          {book.authors && book.authors.map((name) => (
            <span>
              {`${name} `}
            </span>
          ))}
          <span>
            | Аскер | 24.03.1984
          </span>
        </AuthorProps>
        <AuthorSpeech>
          <RedQuote>
            &#187;
          </RedQuote>
          <Quotes>&#171;</Quotes>
          Мне всегда нравилось представлять себя кем-то другим:
          собакой, тюльпаном, соседом дядей Васей, путешественницей к другим планетам.
          В детстве я так играла. Мне хотелось прожить много разных жизней,
          попробовать много разных занятий. Писательство —
          это реинкарнация без необходимости умирать.
          Можно оказаться там, куда тебе не добраться физически,
          исследовать то, к чему у тебя нет доступа.
          И даже то, чего не существует. Я просто продолжаю играть, вот и всё»
          <Quotes>&#187;</Quotes>
        </AuthorSpeech>
      </AuthorDescr>
    </AuthorInfo>
    <AuthorAbout>
      Катерина Кюне, родилась в 1984 году в Магадане.
      По семейной легенде, родители нашли её в громадном сугробе,
      который намело под их окнами. В детстве писала стихи и песни,
      придумывала страшные истории, которыми пугала подруг.
      Училась в Санкт-Петербургском университете телекоммуникаций,
      но бросила после второго курса. Переехала в Москву.
      Окончила Литературный институт имени Горького.
      Работала методистом, корреспондентом, копирайтером, координатором благотворительного фонда,
      выпускающим редактором, репетитором по математике, продавцом-буфетчицей,
      разработчиком электронных курсов.
      Делала лампы из мусора. Занималась научной журналистикой.
      На заказ написала историческую биографию предков одного из российских олигархов.
      Книга была дорого издана и богата иллюстрирована,
      но кроме семьи олигарха её никто не прочёл.
      Жила в разных городах: в Магадане, Майкопе, Санкт-Петербурге,
      Москве, Севастополе, Ярославле, Бангкоке, Берлине.
      Сейчас живёт в Аскере — норвежском городке рядом с Осло.
      Зарабатывает трейдингом. Имеет публикации в журналах «Знамя»,
      «Эмигрантская лира», «Дружба народов»,
      «Лиterraтура», «Этажи», «Берлин. Берега» (Германия) и других.
      Лауреат премии литературного журнала «Знамя». Автор повести «Здесь должна быть я».
    </AuthorAbout>
    <AuthorContacts>
      <span>
        Контакты:
      </span>
      <ContactsList>
        {contactIconsSrc.map((iconSrc) => (
          <ContactsItem>
            <ContactLink
              href='fakeHref'
              target='_blank'
              rel='noreferrer'
            >
              <ReactSVG src={iconSrc} />
            </ContactLink>
          </ContactsItem>
        ))}
      </ContactsList>
    </AuthorContacts>
  </StyleWrapper>
);

export default BookAuthor;
