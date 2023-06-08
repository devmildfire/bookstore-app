import Image from 'next/image';
import styled from 'styled-components';
import {
  Button,
  ButtonsContainer,
  BuyIcon,
  OldPrice,
  Price,
  PriceContainer,
} from './styles';
import { ProductCardProps } from './ProductCard';
import { useModal } from '../Modal/Modal';
import { IconButton } from '../Common/IconButton';

const BookWrapper = styled.div`
  position: relative;
  perspective: 800px;
  outline: none;

  &:hover .book,
  &:focus .book {
    transform: rotateY(-15deg) translateX(-20px) scale(1.05);
  }
`;

const Book = styled.div`
  img {
    border-radius: 6px 2px 2px 6px;
    outline: thin solid transparent;
  }
  border-radius: 6px 2px 2px 6px;
  outline: thin solid transparent;
  display: flex;
  position: relative;
  cursor: pointer;
  max-width: 335px;
  aspect-ratio: 6/9;
  transition: transform 0.3s ease;
  transform-origin: left;
  transform-style: preserve-3d;
  transform: rotateY(0deg);
  box-shadow: 0 1.8px 3.6px rgba(0, 0, 0, 0.05),
    0 10.8px 21.6px rgba(0, 0, 0, 0.08), inset 0 -0.9px 0 rgba(0, 0, 0, 0.1),
    inset 0 1.8px 1.8px hsla(0, 0%, 100%, 0.2),
    inset 3.6px 0 3.6px rgba(0, 0, 0, 0.2);
`;

const Cover = styled(Image)`
  position: relative;
  z-index: 1;
  /* NOTE(@sergromm): у обложек разное разрешение.
    Нужно стандартизировать и убрать cover, иначе некотрые обложки обрезаются */
  object-fit: cover;
  width: 100%;
`;

const Lightmap = styled.div`
  inset: 0;
  position: absolute;
  z-index: 2;
  background-color: transparent;
  background-image: linear-gradient(
      90deg,
      hsla(0, 0%, 100%, 0),
      hsla(0, 0%, 100%, 0) 2%,
      hsla(0, 0%, 100%, 0.08) 4%,
      hsla(0, 0%, 100%, 0) 5%,
      hsla(0, 0%, 100%, 0) 6%,
      hsla(0, 0%, 100%, 0.04) 7%,
      hsla(0, 0%, 100%, 0) 8%
    ),
    linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.03),
      rgba(0, 0, 0, 0.1) 1%,
      transparent 2%,
      rgba(0, 0, 0, 0.02) 4%,
      rgba(0, 0, 0, 0.1) 5%,
      rgba(0, 0, 0, 0.3) 6%,
      rgba(0, 0, 0, 0.15) 7%,
      transparent
    );
  background-position: bottom;
  background-size: cover;
`;

const Pages = styled.div`
  content: '';
  background: linear-gradient(90deg, rgb(201, 201, 201) 0, transparent 30%),
    linear-gradient(rgb(238, 238, 238), rgb(218, 218, 218));
  height: 100%;
  width: 40px;
  top: 0px;
  right: 0px;
  position: absolute;
  transform-origin: 0 0;
  transform: translateX(92%) rotateY(80deg);
`;

const BackCover = styled.div<{ src: string }>`
  position: absolute;
  top: 50%;
  right: 0;
  left: 0;
  bottom: 0;
  width: 102%;
  height: 101%;
  background-image: url(${(props) => props.src});
  background-size: cover;
  background-position: center;
  transform: translateZ(-40px) translateY(-50%);
  border-radius: 6px 2px 2px 6px;
  outline: thin solid transparent;
`;

const Footer = styled.div`
  position: relative;
  background-color: transparent;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 48px 0 18px;
`;

export default function ProductCard3d(props: ProductCardProps) {
  const { price, cover, title, onClick, onEnterKey, newPrice, authors, types } =
    props;

  const { handleModalState, handleOpenModal } = useModal();

  const onAddToCartClick = () => {
    handleModalState({
      title,
      price,
      // newPrice,
      author: authors.map((author) => author.name).join(', '),
      types,
    });
    handleOpenModal(true, 'book');
  };

  return (
    <BookWrapper tabIndex={0}>
      <Book onMouseUp={onClick} onKeyDown={onEnterKey} className='book'>
        <Cover
          alt='cover'
          src={cover}
          width={330}
          height={550}
          className='cover'
        />
        <Pages className='pages' />
        <BackCover aria-hidden='true' src={cover} className='back-cover' />
        <Lightmap className='lightmap' />
      </Book>
      <Footer>
        <PriceContainer>
          <Price>{`${newPrice === null ? price : newPrice}₽`}</Price>
          <OldPrice discount>{newPrice && `${price}₽`}</OldPrice>
        </PriceContainer>
        <ButtonsContainer>
          <IconButton onClick={onAddToCartClick}>
            <BuyIcon />
          </IconButton>
          {/* <Button type='button'>В Избранное</Button> */}
        </ButtonsContainer>
      </Footer>
    </BookWrapper>
  );
}
