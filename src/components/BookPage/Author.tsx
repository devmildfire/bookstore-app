import React, { ReactElement } from 'react';
import { ReactSVG } from 'react-svg';
import styled from 'styled-components';
import { TBookProps } from './Book';
import {spans} from 'next/dist/build/webpack/plugins/profiling-plugin';

const Title = styled.h2`
  margin-bottom: 30px;
  text-align: center;
  font-family: Cheque;
  font-weight: 900;
  font-size: 57px;
  line-height: 68px;
`;

const StyleWrapper = styled.div`
  margin-bottom: 105px;
`;

const AuthorInfo = styled.div`
  margin-bottom: 40px;
  display: flex;
`;

const AuthorFoto = styled.img`
  margin-right: 40px;
`;

const AuthorDescr = styled.div`
  font-size: 24px;
  line-height: 29px;
`;

const AuthorProps = styled.div`
  margin-bottom: 40px;
  font-weight: 700;  
`;

const AuthorSpeech = styled.p`
  max-width: 661px;
  font-style: italic;
  font-weight: 400;
`;

const AuthorAbout = styled.p`
  margin-bottom: 54px;
  font-size: 18px;
  line-height: 22px;
`;

const AuthorContacts = styled.div`
  display: flex;
  justify-content:center;
  font-size: 18px;
  line-height: 22px;
  
  span {
    margin-right: 25px;
    font-weight: 700;
  }
`;

const ContactsList = styled.ul`
  display: flex;
  align-items: center;
`;

const ContactsItem = styled.li`
  &:not(:last-child) {
    margin-right: 30px;
  }
`;

const ContactsLink = styled.a`

`;

const Author = ({ book }: TBookProps): ReactElement => (
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
          {book.author && book.author}
          {book.authors && book.authors.map((name) => (
            <span>
              {`${name} `}
            </span>
          ))}
          | Аскер | 24.03.1984
        </AuthorProps>
        <AuthorSpeech>
          «Мне всегда нравилось представлять себя кем-то другим:
          собакой, тюльпаном, соседом дядей Васей, путешественницей к другим планетам.
          В детстве я так играла. Мне хотелось прожить много разных жизней,
          попробовать много разных занятий. Писательство —
          это реинкарнация без необходимости умирать.
          Можно оказаться там, куда тебе не добраться физически,
          исследовать то, к чему у тебя нет доступа.
          И даже то, чего не существует. Я просто продолжаю играть, вот и всё»
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
        <ContactsItem>
          <ContactsLink
            href='mailto:example@example.com'
            target='_blank'
          >
            <ReactSVG src='/email.svg' />
          </ContactsLink>
        </ContactsItem>
        <ContactsItem>
          <ContactsLink
            href='http://instagram.com'
            target='_blank'
          >
            <ReactSVG src='/instagram.svg' />
          </ContactsLink>
        </ContactsItem>
        <ContactsItem>
          <ContactsLink
            href='http://facebook.com'
            target='_blank'
          >
            <ReactSVG src='/facebook.svg' />
          </ContactsLink>
        </ContactsItem>
        <ContactsItem>
          <ContactsLink
            href='http://t.me/username'
            target='_blank'
          >
            <ReactSVG src='/telegram.svg' />
          </ContactsLink>
        </ContactsItem>
        <ContactsItem>
          <ContactsLink
            href='http://vk.com'
            target='_blank'
          >
            <ReactSVG src='/vk.svg' />
          </ContactsLink>
        </ContactsItem>
      </ContactsList>
    </AuthorContacts>
  </StyleWrapper>
);

export default Author;
