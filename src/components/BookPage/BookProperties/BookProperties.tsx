/* eslint-disable react/jsx-one-expression-per-line */
import React, { ReactElement, useEffect, useState } from 'react';
import styled from 'styled-components';
// import dayjs from 'dayjs';
import Button from '@/components/Common/Button';
import { StyledWrapper } from './styles';
import { BookTableTypesEnum, BookType, Worker } from '@/models/books';
import Tabs from '@/components/Common/Tabs';
import breakPoints from '@/utils/breakPoints';
import { Title } from 'pages/books';
import { useRouter } from 'next/router';
import { titlesStore } from '@/store/locals/dashboard/TitlesStore/TitlesStore';
import { setOrGetCartCookie } from '@/utils/cardID';
import { supabase } from 'api/supabase-client';
import { CartItemType } from 'pages/api/cart';
import { Database } from 'api/books/types';
import Link from 'next/link';
import { postData } from '@/utils/postData';
import BookPhotos from '../BookPhotos/BookPhotos';
import { EmblaOptionsType } from 'embla-carousel';

const OPTIONS: EmblaOptionsType = { loop: true };

type productCtegory = Database['public']['Enums']['category'];

interface BookPropertiesProps {
  readonly prices: Record<BookTableTypesEnum, number>[];
  readonly first_release: Date;
  readonly types: Record<string, unknown | BookTableTypesEnum>[];
}

export interface EditionProps {
  releaseDate: string;
  price: number;
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
  text-align: end;
  @media ${breakPoints.lg} {
    font-size: 10px;
  }
`;

const Descrption = styled.div`
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
  gap: 16px;
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
  align-items: flex-end;
  /* max-width: 223px; */
  @media ${breakPoints.lg} {
    /* max-width: 160px; */
  }
  @media screen and (max-width: 576px) {
    gap: 0px;
    /* max-width: 223px; */
    padding-bottom: 22px;
    justify-content: center;
    align-items: right;
    align-self: center;
  }
`;

type addBookProps = {
  name: string;
  author: string;
  category: productCtegory;
  price: number;
  discount: number;
  src: string;
};

async function addBookToCart({
  name,
  author,
  category,
  price,
  discount,
  src,
}: addBookProps) {
  const item: CartItemType = {
    id: setOrGetCartCookie()!.toString(),
    name: name,
    category: category,
    quantity: 1,
    price: price,
    discount: discount,
    subtitle: author,
    picture: src,
  };

  const addedItem: CartItemType = await postData(`/api/cart`, {
    oper: 'update',
    item: item,
  });
}

const DigitalEdition = () => {
  const router = useRouter();
  const slug = router.query.slug;

  const title =
    titlesStore?.titles?.filter((title) => title.slug === slug)[0] || null;

  const eBook = title?.eBook || null;

  const [bookIsInTheCart, setBookIsInTheCart] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);

  const checkTheCart = async (titleName: string) => {
    const cartID = setOrGetCartCookie()!.toString();

    const inCart = await supabase
      .from('Cart')
      .select('*')
      .eq('id', cartID)
      .eq('name', titleName)
      .eq('category', 'EBook');

    if (inCart.data && inCart.data?.length > 0) {
      setBookIsInTheCart(true);
    }
  };

  useEffect(() => {
    title && checkTheCart(title.name);
  }, [buttonClicked]);

  if (!eBook || !title) {
    return <div> no digital edition </div>;
  }

  const { demo, authors } = title;
  const authorsString = authors.map((author) => author.name).join(', ');

  const { price, discount, releaseDate, characters, extra } = eBook;

  return (
    <TabContent>
      <TitleConteiner>
        <TabTitle>Цифровое издание</TabTitle>
        <Price>{price}₽</Price>
      </TitleConteiner>
      <Descrption>
        <Buttons>
          {!bookIsInTheCart && !buttonClicked && (
            <TabButton
              className='cartButton'
              type='button'
              onClick={() => {
                addBookToCart({
                  name: title.name,
                  price: price,
                  discount: discount,
                  author: authorsString,
                  category: 'EBook',
                  src: title.cover,
                });
                setButtonClicked(true);
              }}
            >
              Добавить в корзину
            </TabButton>
          )}

          {(bookIsInTheCart || buttonClicked) && (
            <ButtonsText>
              <Link
                href={'/cart'}
                className='hover:underline hover:text-red-600 text-red-800 duration-300'
              >
                электронная книга уже в корзине
              </Link>
            </ButtonsText>
          )}
          <TabButton href={demo}>Демо-версия</TabButton>
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
              {new Intl.NumberFormat('ru-RU').format(characters)}
            </DescriptionValue>
          </DesctiptionItem>
          <DesctiptionItem>
            <DescriptionKey>Над изданием работали:</DescriptionKey>
            <DescriptionValue>
              {extra}
              {/* редактор Наталья&nbsp;Кислова, веб-мастер Серафим&nbsp;Лоза,
              дизайнер Екатерина&nbsp;Яковлева, верстальщик Леон&nbsp;Меликьянц,
              иллюстратор Евгений&nbsp;Борщевский */}
            </DescriptionValue>
          </DesctiptionItem>
        </Paragraphs>
      </Descrption>
    </TabContent>
  );
};

const Book2Edition = () => {
  const router = useRouter();
  const slug = router.query.slug;

  const title =
    titlesStore?.titles?.filter((title) => title.slug === slug)[0] || null;

  const cardBook = title?.cardBook || null;

  const [bookIsInTheCart, setBookIsInTheCart] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);

  const checkTheCart = async (titleName: string) => {
    const cartID = setOrGetCartCookie()!.toString();

    const inCart = await supabase
      .from('Cart')
      .select('*')
      .eq('id', cartID)
      .eq('name', titleName)
      .eq('category', 'Book2.0');

    if (inCart.data && inCart.data?.length > 0) {
      setBookIsInTheCart(true);
    }
  };

  useEffect(() => {
    title && checkTheCart(title.name);
  }, [buttonClicked]);

  if (!cardBook || !title) {
    return <div> no Book 2.0 edition </div>;
  }

  const { demo, authors } = title;
  const authorsString = authors.map((author) => author.name).join(', ');

  const { price, discount, releaseDate, extra } = cardBook;

  return (
    <TabContent>
      <TitleConteiner>
        <TabTitle>Книга 2.0</TabTitle>
        <Price>{price}₽</Price>
      </TitleConteiner>
      <Descrption>
        <Buttons>
          {!bookIsInTheCart && !buttonClicked && (
            <TabButton
              className='cartButton'
              type='button'
              onClick={() => {
                addBookToCart({
                  name: title.name,
                  price: price,
                  discount: discount,
                  author: authorsString,
                  category: 'Book2.0',
                  src: title.cover,
                });
                setButtonClicked(true);
              }}
            >
              Добавить в корзину
            </TabButton>
          )}

          {(bookIsInTheCart || buttonClicked) && (
            <ButtonsText>
              <Link
                href={'/cart'}
                className='hover:underline hover:text-red-600 text-red-800 duration-300'
              >
                книга 2.0 уже в корзине
              </Link>
            </ButtonsText>
          )}

          <TabButton href={demo}>Демо-версия</TabButton>
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
              {extra}
              {/* редактор Наталья&nbsp;Кислова, веб-мастер Серафим&nbsp;Лоза,
              дизайнер Екатерина&nbsp;Яковлева, верстальщик Леон&nbsp;Меликьянц,
              иллюстратор Евгений&nbsp;Борщевский */}
            </DescriptionValue>
          </DesctiptionItem>
        </Paragraphs>
      </Descrption>
    </TabContent>
  );
};

const AudioEdition = () => {
  const router = useRouter();
  const slug = router.query.slug;

  const title =
    titlesStore?.titles?.filter((title) => title.slug === slug)[0] || null;

  const audioBook = title?.audioBook || null;

  const [bookIsInTheCart, setBookIsInTheCart] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);

  const checkTheCart = async (titleName: string) => {
    const cartID = setOrGetCartCookie()!.toString();

    const inCart = await supabase
      .from('Cart')
      .select('*')
      .eq('id', cartID)
      .eq('name', titleName)
      .eq('category', 'AudioBook');

    if (inCart.data && inCart.data?.length > 0) {
      setBookIsInTheCart(true);
    }
  };

  useEffect(() => {
    title && checkTheCart(title.name);
  }, [buttonClicked]);

  if (!audioBook || !title) {
    return <div> no audioBook edition </div>;
  }

  const { demo, authors } = title;
  const authorsString = authors.map((author) => author.name).join(', ');

  const { price, discount, releaseDate, extra, duration, fileVolume } =
    audioBook;

  const fileSize = parseInt(fileVolume) / 1024;
  const hours = Math.floor(duration / 3600);
  const mins = Math.floor((duration % 3600) / 60);

  return (
    <TabContent>
      <TitleConteiner>
        <TabTitle>Аудиокнига mp3</TabTitle>
        <Price>{price}₽</Price>
      </TitleConteiner>
      <Descrption>
        <Buttons>
          {!bookIsInTheCart && !buttonClicked && (
            <TabButton
              className='cartButton'
              type='button'
              onClick={() => {
                addBookToCart({
                  name: title.name,
                  price: price,
                  discount: discount,
                  author: authorsString,
                  category: 'AudioBook',
                  src: title.cover,
                });
                setButtonClicked(true);
              }}
            >
              Добавить в корзину
            </TabButton>
          )}

          {(bookIsInTheCart || buttonClicked) && (
            <ButtonsText>
              <Link
                href={'/cart'}
                className='hover:underline hover:text-red-600 text-red-800 duration-300'
              >
                аудиокнига уже в корзине
              </Link>
            </ButtonsText>
          )}

          <TabButton href={demo}>Демо-версия</TabButton>
        </Buttons>
        <Paragraphs>
          <DesctiptionItem>
            <DescriptionKey> Детали:</DescriptionKey>
            <DescriptionValue> {extra} </DescriptionValue>
          </DesctiptionItem>
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
            <DescriptionValue>{fileSize} Мб</DescriptionValue>
          </DesctiptionItem>
          <DesctiptionItem>
            <DescriptionKey>Длительность:</DescriptionKey>
            <DescriptionValue>
              {hours}ч {mins}м
            </DescriptionValue>
          </DesctiptionItem>
        </Paragraphs>
      </Descrption>
    </TabContent>
  );
};

const PrintEdition = () => {
  const router = useRouter();
  const slug = router.query.slug;

  const title =
    titlesStore?.titles?.filter((title) => title.slug === slug)[0] || null;

  const printBook = title?.printedBook || null;

  const [bookIsInTheCart, setBookIsInTheCart] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);

  const checkTheCart = async (titleName: string) => {
    const cartID = setOrGetCartCookie()!.toString();

    const inCart = await supabase
      .from('Cart')
      .select('*')
      .eq('id', cartID)
      .eq('name', titleName)
      .eq('category', 'PrintBook');

    if (inCart.data && inCart.data?.length > 0) {
      setBookIsInTheCart(true);
    }
  };

  useEffect(() => {
    title && checkTheCart(title.name);
  }, [buttonClicked]);

  if (!printBook || !title) {
    return <div> no printBook edition </div>;
  }

  const { demo, authors } = title;

  const authorsString = authors.map((author) => author.name).join(', ');

  const {
    price,
    discount,
    releaseDate,
    extra,
    pages,

    options,
  } = printBook;

  const { size, paper, cover, bindings, illustrations } = options[0];
  const { width, height } = size[0];

  const printPhotos = title.Photos.filter(
    (photo) => photo.category === 'PrintBook'
  );

  return (
    <TabContent>
      <TitleConteiner>
        <TabTitle>Печатное издание</TabTitle>
        <Price>{price}₽</Price>
      </TitleConteiner>

      <Descrption>
        <Buttons>
          {!bookIsInTheCart && !buttonClicked && (
            <TabButton
              className='cartButton'
              type='button'
              onClick={() => {
                addBookToCart({
                  name: title.name,
                  price: price,
                  discount: discount,
                  author: authorsString,
                  category: 'PrintBook',
                  src: title.cover,
                });
                setButtonClicked(true);
              }}
            >
              Добавить в корзину
            </TabButton>
          )}

          {(bookIsInTheCart || buttonClicked) && (
            <ButtonsText>
              <Link
                href={'/cart'}
                className='hover:underline hover:text-red-600 text-red-800 duration-300'
              >
                книга уже в корзине
              </Link>
            </ButtonsText>
          )}

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
            <DescriptionValue>
              {width}x{height} мм
            </DescriptionValue>
          </DesctiptionItem>
          <DesctiptionItem>
            <DescriptionKey>Объём:</DescriptionKey>
            <DescriptionValue>{pages} стр</DescriptionValue>
          </DesctiptionItem>
          <DesctiptionItem>
            <DescriptionKey>Бумага:</DescriptionKey>
            <DescriptionValue>{paper}</DescriptionValue>
          </DesctiptionItem>
          <DesctiptionItem>
            <DescriptionKey>Обложка:</DescriptionKey>
            <DescriptionValue>{cover}</DescriptionValue>
          </DesctiptionItem>
          <DesctiptionItem>
            <DescriptionKey>Переплет:</DescriptionKey>
            <DescriptionValue>{bindings}</DescriptionValue>
          </DesctiptionItem>
          <DesctiptionItem>
            <DescriptionKey>Иллюстрации:</DescriptionKey>
            <DescriptionValue>{illustrations}</DescriptionValue>
          </DesctiptionItem>
          <DesctiptionItem>
            <DescriptionKey>Над изданием работали:</DescriptionKey>
            <DescriptionValue>{extra}</DescriptionValue>
          </DesctiptionItem>
        </Paragraphs>
      </Descrption>
      {printPhotos.length > 0 && (
        <BookPhotos photos={printPhotos} options={OPTIONS} />
      )}
    </TabContent>
  );
};

type EditionComponent = () => ReactElement;

export type EditionType = Record<BookTableTypesEnum[number], EditionComponent>;

// const editions: EditionType = {
//   Ebooks: DigitalEdition,
//   CardBooks: Book2Edition,
//   Audiobooks: AudioEdition,
//   PrintedBooks: PrintEdition,
// };

const editions: EditionType = {
  eBook: DigitalEdition,
  cardBook: Book2Edition,
  audioBook: AudioEdition,
  printedBook: PrintEdition,
};

const BookProperties = (title: Title): React.ReactElement => {
  const priceArr = [];
  const typesArr = [];

  title.printedBook &&
    (priceArr.push({ printedBook: title.printedBook?.price }),
    typesArr.push({
      type: BookTableTypesEnum.PrintedBooks,
      info: title[BookTableTypesEnum.PrintedBooks],
    }));
  title.eBook &&
    (priceArr.push({ eBook: title.eBook.price }),
    typesArr.push({
      type: BookTableTypesEnum.Ebooks,
      info: title[BookTableTypesEnum.Ebooks],
    }));
  title.audioBook &&
    (priceArr.push({ audioBook: title.audioBook.price }),
    typesArr.push({
      type: BookTableTypesEnum.Audiobooks,
      info: title[BookTableTypesEnum.Audiobooks],
    }));
  title.cardBook &&
    (priceArr.push({ cardBook: title.cardBook.price }),
    typesArr.push({
      type: BookTableTypesEnum.CardBooks,
      info: title[BookTableTypesEnum.CardBooks],
    }));

  return (
    <StyledWrapper>
      <Tabs
        types={typesArr}
        first_release={new Date(title.firstRelease)}
        prices={priceArr}
        editions={editions}
      />
    </StyledWrapper>
  );
};

export default BookProperties;
