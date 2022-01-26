import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import styled from 'styled-components';
import { BookCardProps } from '../../src/components/BookCard';
import Button from '../../src/components/Common/Button';
import Icon from '../../src/components/Common/Icon';


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
              <div className="propsBody">
                  <div className="propsBtnBlock">
                      <Button
                          text='Добавить в корзину'
                          className='propsBtn'
                      />
                      <Button
                          text='Демо-версия'
                          className='propsBtn'
                      />
                  </div>
                  <div className="propsItems">
                      <div className="propsItem">
                          Форматы: Fb2, Epub
                      </div>
                      <div className="propsItem">
                          Кол-во символов: 355000
                      </div>
                      <div className="propsItem readersList">
                          Рекомендуемые читалки:
                          <div className="readersItem">
                              eBoox: Android | iPhone
                          </div>
                          <div className="readersItem">
                              FBReader: Android | iPhone
                          </div>
                          <div className="readersItem">
                              KyBooks: iPhone
                          </div>
                      </div>
                  </div>
              </div>
              <div className="propsFooter">
                  Над изданием работали: редактор Наталья Кислова, веб-мастер Серафим Лоза, дизайнер Екатерина Яковлева, верстальщик Леон Меликьянц, иллюстратор Евгений Борщевский
              </div>
          </div>
          <div className="trailer">
              <h2 className="title">
                  Буктрейлер
              </h2>

          </div>
          <div className="author">
              <h2 className="title">
                  Об авторе
              </h2>
              <div className="authorInfo">
                  <img
                      src=""
                      alt="Автор"
                  />
                  <div className="authorDescr">
                      <div className="authorProps">
                          Катерина Кюне | Аскер | 24.03.1984
                      </div>
                      <div className="authorSpeech">
                          «Мне всегда нравилось представлять себя кем-то другим: собакой, тюльпаном, соседом дядей Васей, путешественницей к другим планетам. В детстве я так играла. Мне хотелось прожить много разных жизней, попробовать много разных занятий. Писательство — это реинкарнация без необходимости умирать. Можно оказаться там, куда тебе не добраться физически, исследовать то, к чему у тебя нет доступа. И даже то, чего не существует. Я просто продолжаю играть, вот и всё»
                      </div>
                  </div>
              </div>
              <div className="authorAbout">
                  Катерина Кюне, родилась в 1984 году в Магадане. По семейной легенде, родители нашли её в громадном сугробе, который намело под их окнами. В детстве писала стихи и песни, придумывала страшные истории, которыми пугала подруг. Училась в Санкт-Петербургском университете телекоммуникаций, но бросила после второго курса. Переехала в Москву. Окончила Литературный институт имени Горького. Работала методистом, корреспондентом, копирайтером, координатором благотворительного фонда, выпускающим редактором, репетитором по математике, продавцом-буфетчицей, разработчиком электронных курсов. Делала лампы из мусора. Занималась научной журналистикой. На заказ написала историческую биографию предков одного из российских олигархов. Книга была дорого издана и богата иллюстрирована, но кроме семьи олигарха её никто не прочёл. Жила в разных городах: в Магадане, Майкопе, Санкт-Петербурге, Москве, Севастополе, Ярославле, Бангкоке, Берлине. Сейчас живёт в Аскере — норвежском городке рядом с Осло. Зарабатывает трейдингом. Имеет публикации в журналах «Знамя», «Эмигрантская лира», «Дружба народов», «Лиterraтура», «Этажи», «Берлин. Берега» (Германия) и других. Лауреат премии литературного журнала «Знамя». Автор повести «Здесь должна быть я».
              </div>
              <div className="authorContacts">
                  Контакты:
                  <ul className="contactsList">
                      <a href="mailto:example@example.com" className="contactLink">
                          <li className="contactsItem contactsItem-email">
                              <Icon src='../../public/images/email.svg' />
                          </li>
                      </a>
                      <a href="http://instagram.com" className="contactLink" target="_blank">
                          <li className="contactsItem contactsItem-instagram">
                              <Icon src='../../public/images/instagram.svg' />
                          </li>
                      </a>
                      <a href="http://facebook.com" className="contactLink" target="_blank">
                          <li className="contactsItem contactsItem-facebook">
                              <Icon src='../../public/images/facebook.svg' />
                          </li>
                      </a>
                      <a href="http://t.me/username" className="contactLink" target="_blank">
                          <li className="contactsItem contactsItem-telegram">
                              <Icon src='../../public/images/telegram.svg' />
                          </li>
                      </a>
                      <a href="http://vk.com" className="contactLink" target="_blank">
                          <li className="contactsItem contactsItem-vk">
                              <Icon src='../../public/images/vk.svg' />
                          </li>
                      </a>
                  </ul>
              </div>
          </div>
      </div>
  </StyleWrapper>
)};

export default BookPage;

const StyleWrapper = styled.div`
    max-width: 1394px;
    margin: 0 auto;
`
