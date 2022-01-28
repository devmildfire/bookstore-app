import React from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { ReactSVG } from 'react-svg';
import colors from '../../src/utils/colors';
import Button from '../../src/components/Common/Button';

const BookPage = (): React.ReactElement => (
  <StyleWrapper>
    <Head>
      <title>DELETED</title>
    </Head>
    <Book>
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
    </Book>
    <Props>
      <PropsHeader>
        <PropsTitle>
          ЦИФРОВОЕ ИЗДАНИЕ
        </PropsTitle>
        <PropsPrice>
          300₽
        </PropsPrice>
        <PropsDate>
          Дата релиза: дд.мм.гггг
        </PropsDate>
      </PropsHeader>
      <PropsBody>
        <PropsBtnBlock>
          <Button
            text='Добавить в корзину'
            className='propsBtn'
          />
          <Button
            text='Демо-версия'
            className='propsBtn'
          />
        </PropsBtnBlock>
        <PropsItems>
          <PropsItem>
            Форматы: Fb2, Epub
          </PropsItem>
          <PropsItem>
            Кол-во символов: 355000
          </PropsItem>
          <PropsItem>
            <span>
              Рекомендуемые читалки:
            </span>
            <ReadersList>
              <ReadersItem>
                eBoox: Android | iPhone
              </ReadersItem>
              <ReadersItem>
                FBReader: Android | iPhone
              </ReadersItem>
              <ReadersItem>
                KyBooks: iPhone
              </ReadersItem>
            </ReadersList>
          </PropsItem>
        </PropsItems>
      </PropsBody>
      <PropsFooter>
        Над изданием работали: редактор Наталья Кислова,
        веб-мастер Серафим Лоза, дизайнер Екатерина Яковлева,
        верстальщик Леон Меликьянц, иллюстратор Евгений Борщевский
      </PropsFooter>
    </Props>
    <Trailer>
      <Title>
        Буктрейлер
      </Title>
      <TrailerVideo
        src='/images/trailerScreenShot.png'
        alt='Trailer'
      />
    </Trailer>
    <Author>
      <Title>
        Об авторе
      </Title>
      <AuthorInfo>
        <AuthorFoto
          src='/images/authors/kune.jpg'
          alt='Автор'
        />
        <AuthorDescr>
          <AuthorProps>
            Катерина Кюне | Аскер | 24.03.1984
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
    </Author>
    <Similar>
      <SimilarTitle>
        Познайте также
      </SimilarTitle>
      <SimilarBooks>
      </SimilarBooks>
    </Similar>
  </StyleWrapper>
);

export default BookPage;

const StyleWrapper = styled.div`
  max-width: 1394px;
  padding: 30px 0 166px;
  margin: 0 auto;
  color: ${colors.whiteBase};
  
  .propsBtn {
    margin: 0;
    width: 300px;
    height: 70px;
    font-size: 16px;
    line-height: 20px;
  }
  
  .propsBtn:last-child {
    margin-bottom: 20px;
  }
`;

const Book = styled.div`
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

const Props = styled.div`
  padding: 44px 79px 40px 132px;
  margin-bottom: 200px;
  border: 1px solid #930000;
  box-sizing: border-box;
`;

const PropsHeader = styled.div`
  margin-bottom: 48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PropsTitle = styled.div`
  font-weight: 700;
  font-size: 40px;  
  line-height: 49px;  
`;

const PropsBody = styled.div`
  display: flex;
  
`;

const PropsPrice = styled.div`
  font-weight: 700;
  font-size: 40px;
  line-height: 49px;
`;

const PropsDate = styled.div`
  font-weight: 700;
  font-size: 20px;
  line-height: 24px;
`;

const PropsBtnBlock = styled.div`
  margin-right: 96px;
`;

const PropsItems = styled.div`
  width: 100%;
`;

const PropsItem = styled.div`
  margin-bottom: 30px;
  font-size: 16px;
  line-height: 20px;
  
  span {
    margin-bottom: 20px;
  }
`;

const ReadersList = styled.ul`
  margin-top: 20px;
  display: flex;
  justify-content:space-between;
`;

const ReadersItem = styled.div``;

const PropsFooter = styled.div`
  max-width: 1054px;
  font-size: 14px;
  line-height: 17px;
`;

const Trailer = styled.div`
  margin-bottom: 200px;
`;

const Title = styled.h2`
  margin-bottom: 30px;
  text-align: center;
  font-family: Cheque;
  font-weight: 900;
  font-size: 57px;
  line-height: 68px;
`;

const TrailerVideo = styled.img``;

const Author = styled.div`
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

const Similar = styled.div``;
const SimilarTitle = styled.h2`
  margin-bottom: 50px;
  text-align: center;
  font-family: Cheque;
  font-style: normal;
  font-weight: 900;
  font-size: 44px;
  line-height: 53px;
  color: ${colors.red};
`;
const SimilarBooks = styled.div`

`;