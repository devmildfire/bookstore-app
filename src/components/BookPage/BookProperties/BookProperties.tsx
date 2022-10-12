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
`;

const Price = styled.p`
  font-size: 40px;
  font-weight: 700;
`;

const TitleConteiner = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-bottom: 35px;
`;

const ReleaseDate = styled.p`
  font-weight: 700;
  font-size: 20px;
  line-height: 24px;
`;

const Descrption = styled.div`
  display: flex;
  flex-direction: row;
  gap: 44px;
`;
const Paragraphs = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
const Text = styled.p`
  font-size: 16px;
`;
const List = styled.ul`
  display: flex;
  flex-direction: row;
  padding-bottom: 24px;
  gap: 18px;
`;
const ListItem = styled.li``;

const Buttons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const MadeBy = styled.p`
  padding-top: 48px;
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
          <Button>Добавить в корзину</Button>
          <Button>Демо-версия</Button>
        </Buttons>
        <Paragraphs>
          <ReleaseDate>
            Дата релиза: &nbsp;
            <span>{releaseDate}</span>
          </ReleaseDate>
          <Text>Рекомендуемые читалки:</Text>
          <List>
            <ListItem>FBReader: Android | iPhone</ListItem>
            <ListItem>KyBooks: iPhone</ListItem>
            <ListItem>eBoox: Android | iPhone</ListItem>
          </List>
          <Text>Форматы: Fb2, Epub</Text>
          <Text>Количество символов: 355000</Text>
        </Paragraphs>
      </Descrption>
      <MadeBy>
        Над изданием работали: редактор Наталья Кислова, веб-мастер Серафим
        Лоза, дизайнер Екатерина Яковлева, верстальщик Леон Меликьянц,
        иллюстратор Евгений Борщевский
      </MadeBy>
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
      <ReleaseDate>
        Дата релиза: &nbsp;
        <span>{releaseDate}</span>
      </ReleaseDate>
      <Descrption>
        <Buttons>
          <Button>Добавить в корзину</Button>
          <Button>Демо-версия</Button>
        </Buttons>
        <Paragraphs>
          <Text>Отправка по России включена в стоимость.</Text>
          <Text>Рекомендуемые читалки:</Text>
          <List>
            <ListItem>FBReader: Android | iPhone</ListItem>
            <ListItem>KyBooks: iPhone</ListItem>
            <ListItem>eBoox: Android | iPhone</ListItem>
          </List>
          <Text>Формат — 50x70 мм.</Text>
          <Text>Двухстороняя шелкография белым.</Text>
          <Text>Дизайнерская бумага Sirio Black Black 0,7 мм.</Text>
          <Text>Индивидуальная упаковка с цветной запечаткой.</Text>
        </Paragraphs>
      </Descrption>
      <MadeBy>Над изданием работали: asd, asd, asd,</MadeBy>
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
          <Button>Добавить в корзину</Button>
          <Button>Демо-версия</Button>
        </Buttons>
        <Paragraphs>
          <Text>
            Текст читает Ниёле Мейлуте, использована композиция ‘Times Arrow’
            Anamorphic Orchestra.
          </Text>
          <Text>Вес файлов — 305 Мб</Text>
          <Text>Длительность — 5ч 32м</Text>
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
      <ReleaseDate>
        Дата релиза: &nbsp;
        <span>{releaseDate}</span>
      </ReleaseDate>
      <Descrption>
        <Buttons>
          <Button>Добавить в корзину</Button>
        </Buttons>
        <Paragraphs>
          <Text>Цифровое издание в подарок.</Text>
          <Text>Условия доставки обсуждаются индивидуально.</Text>
          <Text>Формат — 145x215 мм.</Text>
          <Text>Объём — 144стр.</Text>
          <Text>Бумага — офсетная 80 гр/кв.м.</Text>
          <Text>Обложка — мелованная 300 гр/кв.м, матовое ламинирование.</Text>
          <Text>Переплет — КБС, термопак поэкземплярно.</Text>
          <Text>Чёрно-белые иллюстрации.</Text>
        </Paragraphs>
      </Descrption>
      <MadeBy>
        Над изданием работали: редактор Наталья Кислова, веб-мастер Серафим
        Лоза, дизайнер Екатерина Яковлева, верстальщик Леон Меликьянц,
        иллюстратор Евгений Борщевский
      </MadeBy>
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
