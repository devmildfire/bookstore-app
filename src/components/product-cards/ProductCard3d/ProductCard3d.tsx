import React, {
  KeyboardEvent as ReactKeyEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  BackCover,
  Book,
  BookWrapper,
  // Cover,
  Footer,
  Lightmap,
  Pages,
} from './styles';

import { ButtonsContainer, OldPrice, Price, PriceContainer } from '../styles';
import CartIcon from '@/assets/icons/ui-icons/add-to-cart.svg';
import { IconButton } from '@/components/Common/IconButton';
import { useModal } from '@/components/Modal/Modal';
import { Title } from 'pages/books';
import { TriggerStyles } from '@/components/Common/Trigger/types';
import { previewStore } from '@/store/locals';
import { observer } from 'mobx-react-lite';

import Image, { ImageProps } from 'next/image';

type CoverPropsType = {
  className: string;
} & ImageProps;

export const Cover = ({
  className,
  src,
  height,
  width,
  alt,
  style,
  // fill,
  blurDataURL,
}: CoverPropsType) => {
  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      // fill={fill}
      style={style}
      placeholder='blur'
      blurDataURL={blurDataURL}
      width={width}
      height={height}
    />
  );
};

export interface ProductCard3DProps extends Title {
  onOpenClick: () => void;
  onCloseClick: () => void;

  onEnterKey: (event: ReactKeyEvent) => void;
  buttonStyle: TriggerStyles;
}

const ProductCard3d = observer((props: ProductCard3DProps) => {
  const {
    id,
    prices,
    discount,
    cover,
    name,
    onOpenClick,
    onCloseClick,
    onEnterKey,
    authors,
    types,
  } = props;

  const [rotated, setRotated] = useState(false);
  const bookRef = useRef<HTMLDivElement>(null);

  const { handleModalState, handleOpenModal } = useModal();

  const onAddToCartClick = () => {
    handleModalState({
      cover,
      name,
      discount,
      price: prices,
      author: authors.map((author) => author.name).join(', '),
      types,
    });
    handleOpenModal(true, 'book');
  };

  const disPrices = prices.map((price, index) =>
    Math.floor((price * (100 - discount[index])) / 100)
  );

  const minPrice = Math.min(...disPrices);

  const minIndex = disPrices.findIndex((x) => x === minPrice);

  useEffect(() => {
    setRotated(previewStore.openTitleID === id);
  }, [previewStore.openTitleID]);

  return (
    <BookWrapper
      tabIndex={0}
      ref={bookRef}
      rotated={rotated}
      onMouseEnter={() => {
        previewStore.openTitleID !== id && setRotated(true);
      }}
      onMouseLeave={() => {
        previewStore.openTitleID !== id && setRotated(false);
      }}
    >
      <Book
        onMouseUp={() => {
          if (previewStore.openTitleID === id) {
            setRotated(false);
            onCloseClick();
            previewStore.openTitleID = null;
            bookRef.current?.blur();
          } else {
            setRotated(true);
            onOpenClick();
            previewStore.openTitleID = id;
          }
        }}
        onKeyDown={onEnterKey}
        className='book'
      >
        <Cover
          alt='cover'
          src={cover}
          width={330}
          height={550}
          className='cover'
          blurDataURL={
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAECAIAAADETxJQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAALklEQVR4nGOQlpI6sn+/vJwcg4Kc/Kc3b5SUlBjEREUN9A3EREVBrMjwcEVFRQDWzwkza7Tb0gAAAABJRU5ErkJggg=='
          }
        />
        <Pages className='pages' />
        <BackCover aria-hidden='true' src={cover} className='back-cover' />
        <Lightmap className='lightmap' />
      </Book>
      <Footer>
        <PriceContainer>
          {/* FIXME: цены починены, но засчёт упрощения ключа prices в типе Title. Теперь там просто массив чисел*/}

          <Price>от {minPrice}</Price>
          <OldPrice discount={discount[minIndex]}>
            {`${prices[minIndex]}₽`}
          </OldPrice>
        </PriceContainer>
        <ButtonsContainer>
          <IconButton
            width={36}
            height={36}
            label='добавить в корзину'
            onClick={onAddToCartClick}
          >
            <CartIcon />
          </IconButton>
          {/* <Button type='button'>В Избранное</Button> */}
        </ButtonsContainer>
      </Footer>
    </BookWrapper>
  );
});

export default React.memo(ProductCard3d);
