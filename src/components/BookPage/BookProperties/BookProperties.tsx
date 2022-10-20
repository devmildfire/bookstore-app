/* eslint-disable react/jsx-one-expression-per-line */
import React, { ReactElement } from 'react';
import styled from 'styled-components';
// import dayjs from 'dayjs';
import Button from '@/components/Common/Button';
import { StyledWrapper } from './styles';
import { BookType, Reader, Worker } from '@/models/books';
import Tabs from '@/components/Common/Tabs';

interface BookPropertiesProps {
  readonly price: number;
  readonly publishDate: string;
  readonly workers: Worker[];
  readonly symbolCount: number;
  readonly formats: string[];
  readonly readers: Reader[];
  readonly types: BookType[];
}

export interface EditionProps {
  releaseDate: string;
  price: number;
}

export interface editionTypes {
  [key: string]: (props: EditionProps) => ReactElement;
}

const TabContent = styled.div``;
const TabTitle = styled.h3`
  font-size: 40px;
  font-weight: 700;
  text-transform: uppercase;
  @media screen and (max-width: 576px) {
    font-size: 16px;
  }
`;

const Price = styled.p`
  font-size: 40px;
  font-weight: 700;
  @media screen and (max-width: 576px) {
    font-size: 16px;
  }
`;

const TitleConteiner = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-bottom: 35px;
`;

const TabButton = styled(Button)`
  @media screen and (max-width: 576px) {
    min-height: 32px;
    font-size: 10px;
    max-width: 223px;
  }
`;

// const ReleaseDate = styled.p`
//   font-weight: 700;
//   font-size: 20px;
//   line-height: 24px;
// `;
const Text = styled.p`
  display: inline-flex;
  justify-content: space-between;
  /* font-size: 16px; */
`;

const Descrption = styled.div`
  display: flex;
  flex-direction: row;
  gap: 44px;
  @media screen and (max-width: 576px) {
    font-size: 10px;
    flex-direction: column;
  }
`;

const DescriptionKey = styled(Text)`
  color: rgb(255, 255, 255, 0.7);
`;
const DescriptionValue = styled.span`
  min-width: 150px;
  color: rgb(255, 255, 255, 1);
  @media screen and (max-width: 576px) {
    max-width: 150px;
  }
`;

const Paragraphs = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const List = styled.ul`
  display: flex;
  flex-direction: row;
  gap: 18px;
`;
const ListItem = styled.li``;

const Buttons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  @media screen and (max-width: 576px) {
    justify-content: center;
    align-items: center;
  }
`;

const DigitalEdition = ({ releaseDate }: EditionProps) => {
  return (
    <TabContent>
      <TitleConteiner>
        <TabTitle>Цифровое издание</TabTitle>
        <Price>300₽</Price>
      </TitleConteiner>
      <Descrption>
        <Buttons>
          <TabButton>Добавить в корзину</TabButton>
          <TabButton>Демо-версия</TabButton>
        </Buttons>
        <Paragraphs>
          <DescriptionKey>
            Дата релиза: &nbsp;
            <DescriptionValue>{releaseDate}</DescriptionValue>
          </DescriptionKey>
          <DescriptionKey>Рекомендуемые читалки:</DescriptionKey>
          <List>
            <ListItem>FBReader: Android | iPhone</ListItem>
            <ListItem>KyBooks: iPhone</ListItem>
            <ListItem>eBoox: Android | iPhone</ListItem>
          </List>
          <DescriptionKey>
            Форматы: <DescriptionValue>Fb2, Epub</DescriptionValue>
          </DescriptionKey>
          <DescriptionKey>
            Количество символов: <DescriptionValue>355000</DescriptionValue>
          </DescriptionKey>
          <DescriptionKey>
            Над изданием работали:
            <DescriptionValue>
              редактор Наталья Кислова, веб-мастер Серафим Лоза, дизайнер
              Екатерина Яковлева, верстальщик Леон Меликьянц, иллюстратор
              Евгений Борщевский
            </DescriptionValue>
          </DescriptionKey>
        </Paragraphs>
      </Descrption>
    </TabContent>
  );
};
const Book2Edition = ({ releaseDate }: EditionProps) => {
  return (
    <TabContent>
      <TitleConteiner>
        <TabTitle>Книга 2.0</TabTitle>
        <Price>300₽</Price>
      </TitleConteiner>
      <Descrption>
        <Buttons>
          <TabButton>Добавить в корзину</TabButton>
          <TabButton>Демо-версия</TabButton>
          <Text>Отправка по России включена в стоимость.</Text>
        </Buttons>
        <Paragraphs>
          <DescriptionKey>
            Дата релиза:
            <DescriptionValue>{releaseDate}</DescriptionValue>
          </DescriptionKey>
          <DescriptionKey>Рекомендуемые читалки:</DescriptionKey>
          <List>
            <ListItem>FBReader: Android | iPhone</ListItem>
            <ListItem>KyBooks: iPhone</ListItem>
            <ListItem>eBoox: Android | iPhone</ListItem>
          </List>
          <DescriptionKey>
            Формат:
            <DescriptionValue>50x70 мм.</DescriptionValue>
            <DescriptionValue>Двухстороняя шелкография белым.</DescriptionValue>
            <DescriptionValue>
              Дизайнерская бумага Sirio Black Black 0,7 мм.
            </DescriptionValue>
            <DescriptionValue>
              Индивидуальная упаковка с цветной запечаткой.
            </DescriptionValue>
          </DescriptionKey>
          <DescriptionKey>
            Над изданием работали:
            <DescriptionValue>asd, asd, asd,</DescriptionValue>
          </DescriptionKey>
        </Paragraphs>
      </Descrption>
    </TabContent>
  );
};

const AudioEdition = (props: EditionProps) => {
  const { price } = props;
  return (
    <TabContent>
      <TitleConteiner>
        <TabTitle>Аудиокнига mp3</TabTitle>
        <Price>{price}₽</Price>
      </TitleConteiner>
      <Descrption>
        <Buttons>
          <TabButton>Добавить в корзину</TabButton>
          <TabButton>Демо-версия</TabButton>
        </Buttons>
        <Paragraphs>
          <DescriptionKey>
            Текст читает:{' '}
            <DescriptionValue>
              Ниёле Мейлуте, использована композиция ‘Times Arrow’ Anamorphic
              Orchestra.
            </DescriptionValue>
          </DescriptionKey>
          <DescriptionKey>
            Вес файлов: <DescriptionValue>305 Мб</DescriptionValue>
          </DescriptionKey>
          <DescriptionKey>
            Длительность: <DescriptionValue>5ч 32м</DescriptionValue>
          </DescriptionKey>
        </Paragraphs>
      </Descrption>
    </TabContent>
  );
};

const PrintEdition = ({ releaseDate }: EditionProps) => {
  return (
    <TabContent>
      <TitleConteiner>
        <TabTitle>Печатное издание</TabTitle>
        <Price>300₽</Price>
      </TitleConteiner>

      <Descrption>
        <Buttons>
          <TabButton>Добавить в корзину</TabButton>
          <Text>Цифровое издание в подарок.</Text>
          <Text>Условия доставки обсуждаются индивидуально.</Text>
        </Buttons>
        <Paragraphs>
          <DescriptionKey>
            Дата релиза: <DescriptionValue>{releaseDate}</DescriptionValue>
          </DescriptionKey>
          <DescriptionKey>
            Формат: <DescriptionValue>145x215 мм.</DescriptionValue>
          </DescriptionKey>
          <DescriptionKey>
            Объём: <DescriptionValue>144стр.</DescriptionValue>
          </DescriptionKey>
          <DescriptionKey>
            Бумага: <DescriptionValue>офсетная 80 гр/кв.м.</DescriptionValue>
          </DescriptionKey>
          <DescriptionKey>
            Обложка:
            <DescriptionValue>
              мелованная 300 гр/кв.м, матовое ламинирование
            </DescriptionValue>
          </DescriptionKey>
          <DescriptionKey>
            Переплет:
            <DescriptionValue>КБС, термопак поэкземплярно</DescriptionValue>
          </DescriptionKey>
          <DescriptionKey>
            Иллюстрации: <DescriptionValue>Чёрно-белые</DescriptionValue>
          </DescriptionKey>
          <DescriptionKey>
            Над изданием работали:
            <DescriptionValue>
              редактор Наталья Кислова, веб-мастер Серафим Лоза, дизайнер
              Екатерина Яковлева, верстальщик Леон Меликьянц, иллюстратор
              Евгений Борщевский
            </DescriptionValue>
          </DescriptionKey>
        </Paragraphs>
      </Descrption>
    </TabContent>
  );
};

const editions: editionTypes = {
  digital: DigitalEdition,
  book2: Book2Edition,
  audio: AudioEdition,
  write: PrintEdition,
};

const BookProperties = (props: BookPropertiesProps): React.ReactElement => {
  return (
    <StyledWrapper>
      <Tabs {...props} editions={editions} />
    </StyledWrapper>
  );
};

export default BookProperties;
