import React, { ReactElement } from 'react';
// import contactIconsSrc from '@/utils/contactIconsData';
import {
  AuthorAbout,
  AuthorContacts,
  AuthorDescr,
  AuthorFoto,
  AuthorInfo,
  AuthorProps,
  AuthorSpeech,
  /*   ContactLink,
  ContactsItem,
  ContactsList, */
  Quotes,
  RedQuote,
  StyleWrapper,
  Title,
} from './styles';

interface BookAuthorProps {
  readonly author: string | null;
  readonly authors: string[] | null;
/*   readonly authorId: number; */
}

const BookAuthor = (props: BookAuthorProps): ReactElement => {
  const { author, authors } = props;
  return (
    <StyleWrapper>
      <Title>Об авторе</Title>
      <AuthorInfo>
        <AuthorFoto src='/images/authors/kune.jpg' alt={`${author}`} />
        <AuthorDescr>
          <AuthorProps>
            {author && <span>{`${author} `}</span>}
            {authors && authors.map((name) => <span>{`${name} `}</span>)}
            <span>| Аскер | 24.03.1984</span>
          </AuthorProps>
          <AuthorSpeech>
            <RedQuote>&#187;</RedQuote>
            <Quotes>&#171;</Quotes>
            Мне всегда нравилось представлять себя кем-то другим: собакой,
            тюльпаном, соседом дядей Васей, путешественницей к другим планетам.
            В детстве я так играла. Мне хотелось прожить много разных жизней,
            попробовать много разных занятий. Писательство — это реинкарнация
            без необходимости умирать. Можно оказаться там, куда тебе не
            добраться физически, исследовать то, к чему у тебя нет доступа. И
            даже то, чего не существует. Я просто продолжаю играть, вот и всё»
            <Quotes>&#187;</Quotes>
          </AuthorSpeech>
        </AuthorDescr>
      </AuthorInfo>
      <AuthorAbout>
        Катерина Кюне, родилась в 1984 году в Магадане. По семейной легенде,
        родители нашли её в громадном сугробе, который намело под их окнами. В
        детстве писала стихи и песни, придумывала страшные истории, которыми
        пугала подруг. Училась в Санкт-Петербургском университете
        телекоммуникаций, но бросила после второго курса. Переехала в Москву.
        Окончила Литературный институт имени Горького. Работала методистом,
        корреспондентом, копирайтером, координатором благотворительного фонда,
        выпускающим редактором, репетитором по математике, продавцом-буфетчицей,
        разработчиком электронных курсов. Делала лампы из мусора. Занималась
        научной журналистикой. На заказ написала историческую биографию предков
        одного из российских олигархов. Книга была дорого издана и богата
        иллюстрирована, но кроме семьи олигарха её никто не прочёл. Жила в
        разных городах: в Магадане, Майкопе, Санкт-Петербурге, Москве,
        Севастополе, Ярославле, Бангкоке, Берлине. Сейчас живёт в Аскере —
        норвежском городке рядом с Осло. Зарабатывает трейдингом. Имеет
        публикации в журналах «Знамя», «Эмигрантская лира», «Дружба народов»,
        «Лиterraтура», «Этажи», «Берлин. Берега» (Германия) и других. Лауреат
        премии литературного журнала «Знамя». Автор повести «Здесь должна быть
        я».
      </AuthorAbout>
      <AuthorContacts>
        <span>Контакты:</span>
        {/*         <ContactsList>
          {contactIconsSrc.map((iconSrc) => (
            <ContactsItem>
              <ContactLink href='fakeHref' target='_blank' rel='noreferrer'>
                <ReactSVG src={iconSrc} />
              </ContactLink>
            </ContactsItem>
          ))}
        </ContactsList> */}
      </AuthorContacts>
    </StyleWrapper>
  );
};

export default BookAuthor;
