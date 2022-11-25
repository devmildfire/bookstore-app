/* eslint-disable react/jsx-one-expression-per-line */
import React, { ReactElement } from 'react';
import styled from 'styled-components';
// import dayjs from 'dayjs';
import Button from '@/components/Common/Button';
import { StyledWrapper } from './styles';
import { BookType, Reader, Worker } from '@/models/books';
import Tabs from '@/components/Common/Tabs';
import breakPoints from '@/utils/breakPoints';

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

  @media ${breakPoints.lg} {
    font-size: 22px;
  }

  @media screen and (max-width: 576px) {
    font-size: 16px;
  }
`;

const Price = styled.p`
  font-size: 40px;
  font-weight: 700;
  @media ${breakPoints.lg} {
    font-size: 22px;
  }
  @media screen and (max-width: 576px) {
    font-size: 16px;
  }
`;

const TitleConteiner = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-bottom: 22px;
`;

const TabButton = styled(Button)`
  margin-bottom: 8px;
  @media ${breakPoints.lg} {
    min-height: 42px;
    font-size: 10px;
    min-width: 162px;
  }
  @media screen and (max-width: 576px) {
    min-height: 32px;
    font-size: 10px;
    min-width: 223px;
    margin-bottom: 12px;
  }
`;

// const ReleaseDate = styled.p`
//   font-weight: 700;
//   font-size: 20px;
//   line-height: 24px;
// `;
const Text = styled.p`
  display: inline-flex;
  justify-content: flex-start;
  /* font-size: 16px; */
`;
const ButtonsText = styled(Text)`
  font-size: 12px;

  @media ${breakPoints.lg} {
    font-size: 10px;
  }
`;

const Descrption = styled.div`
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
  @media ${breakPoints.lg} {
    font-size: 12px;
  }
  @media screen and (max-width: 576px) {
    flex-direction: row;
    font-size: 10px;
    flex-direction: column;
  }
`;

const DesctiptionItem = styled.li`
  list-style: none;
  display: flex;
  flex-wrap: nowrap;
  width: 100%;
  @media screen and (max-width: 576px) {
    gap: 0px;
  }
`;
const DescriptionKey = styled(Text)`
  color: rgb(255, 255, 255, 0.7);
  min-width: 82px;
  max-width: 112px;
  width: 100%;
  @media screen and (min-width: 1024px) {
    min-width: 166px;
    max-width: 250px;
  }
`;
const DescriptionValue = styled.p`
  display: inline-flex;
  width: 100%;
  max-width: 450px;
  color: rgb(255, 255, 255, 1);
  text-align: start;
  @media screen and (max-width: 576px) {
    max-width: 150px;
  }
`;

const Paragraphs = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
const ListItem = styled.li``;

const Buttons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 223px;
  @media ${breakPoints.lg} {
    max-width: 160px;
  }
  @media screen and (max-width: 576px) {
    gap: 0px;
    max-width: 223px;
    padding-bottom: 22px;
    justify-content: center;
    align-items: right;
    align-self: center;
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
          <DesctiptionItem>
            <DescriptionKey>Дата релиза:</DescriptionKey>
            <DescriptionValue>{releaseDate}</DescriptionValue>
          </DesctiptionItem>
          <DesctiptionItem>
            <DescriptionKey>Форматы:</DescriptionKey>
            <DescriptionValue>Fb2, Epub</DescriptionValue>
          </DesctiptionItem>
          <DesctiptionItem>
            <DescriptionKey>Количество символов:</DescriptionKey>
            <DescriptionValue>
              {new Intl.NumberFormat('ru-RU').format(355000)}
            </DescriptionValue>
          </DesctiptionItem>
          <DesctiptionItem>
            <DescriptionKey>Над изданием работали:</DescriptionKey>
            <DescriptionValue>
              редактор Наталья&nbsp;Кислова, веб-мастер Серафим&nbsp;Лоза,
              дизайнер Екатерина&nbsp;Яковлева, верстальщик Леон&nbsp;Меликьянц,
              иллюстратор Евгений&nbsp;Борщевский
            </DescriptionValue>
          </DesctiptionItem>
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
          <ButtonsText>Отправка по России включена в стоимость.</ButtonsText>
        </Buttons>
        <Paragraphs>
          <DesctiptionItem>
            <DescriptionKey>Дата релиза:</DescriptionKey>
            <DescriptionValue>{releaseDate}</DescriptionValue>
          </DesctiptionItem>
          <DesctiptionItem>
            <DescriptionKey>Формат:</DescriptionKey>
            <DescriptionValue>
              <List>
                <ListItem>50x70 мм</ListItem>
                <ListItem>двухстороняя шелкография белым</ListItem>
                <ListItem>
                  дизайнерская бумага Sirio Black Black 0,7 мм
                </ListItem>
                <ListItem>
                  индивидуальная упаковка с цветной запечаткой
                </ListItem>
              </List>
            </DescriptionValue>
          </DesctiptionItem>
          <DesctiptionItem>
            <DescriptionKey>Над изданием работали:</DescriptionKey>
            <DescriptionValue>
              редактор Наталья&nbsp;Кислова, веб-мастер Серафим&nbsp;Лоза,
              дизайнер Екатерина&nbsp;Яковлева, верстальщик Леон&nbsp;Меликьянц,
              иллюстратор Евгений&nbsp;Борщевский
            </DescriptionValue>
          </DesctiptionItem>
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
          <DesctiptionItem>
            <DescriptionKey>Текст читает:</DescriptionKey>
            <DescriptionValue>Ниёле Мейлуте</DescriptionValue>
          </DesctiptionItem>
          <DesctiptionItem>
            <DescriptionKey>Использована композиция:</DescriptionKey>
            <DescriptionValue>
              ‘Times Arrow’ Anamorphic Orchestra
            </DescriptionValue>
          </DesctiptionItem>
          <DesctiptionItem>
            <DescriptionKey>Вес файлов:</DescriptionKey>
            <DescriptionValue>305 Мб</DescriptionValue>
          </DesctiptionItem>
          <DesctiptionItem>
            <DescriptionKey>Длительность:</DescriptionKey>
            <DescriptionValue>5ч 32м</DescriptionValue>
          </DesctiptionItem>
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
          <ButtonsText>Цифровое издание в подарок.</ButtonsText>
          <ButtonsText>Условия доставки обсуждаются индивидуально.</ButtonsText>
        </Buttons>
        <Paragraphs>
          <DesctiptionItem>
            <DescriptionKey>Дата релиза:</DescriptionKey>
            <DescriptionValue>{releaseDate}</DescriptionValue>
          </DesctiptionItem>
          <DesctiptionItem>
            <DescriptionKey>Формат:</DescriptionKey>
            <DescriptionValue>145x215 мм</DescriptionValue>
          </DesctiptionItem>
          <DesctiptionItem>
            <DescriptionKey>Объём:</DescriptionKey>
            <DescriptionValue>144 стр</DescriptionValue>
          </DesctiptionItem>
          <DesctiptionItem>
            <DescriptionKey>Бумага:</DescriptionKey>
            <DescriptionValue>офсетная 80 гр/кв.м.</DescriptionValue>
          </DesctiptionItem>
          <DesctiptionItem>
            <DescriptionKey>Обложка:</DescriptionKey>
            <DescriptionValue>
              мелованная 300 гр/кв.м, матовое ламинирование
            </DescriptionValue>
          </DesctiptionItem>
          <DesctiptionItem>
            <DescriptionKey>Переплет:</DescriptionKey>
            <DescriptionValue>КБС, термопак поэкземплярно</DescriptionValue>
          </DesctiptionItem>
          <DesctiptionItem>
            <DescriptionKey>Иллюстрации:</DescriptionKey>
            <DescriptionValue>чёрно-белые</DescriptionValue>
          </DesctiptionItem>
          <DesctiptionItem>
            <DescriptionKey>Над изданием работали:</DescriptionKey>
            <DescriptionValue>
              редактор Наталья&nbsp;Кислова, веб-мастер Серафим&nbsp;Лоза,
              дизайнер Екатерина&nbsp;Яковлева, верстальщик Леон&nbsp;Меликьянц,
              иллюстратор Евгений&nbsp;Борщевский
            </DescriptionValue>
          </DesctiptionItem>
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
