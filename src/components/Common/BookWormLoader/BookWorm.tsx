// import Link from 'next/link';
import React from 'react';
import Book from '@/assets/icons/book_for_animation.svg';
import styled from 'styled-components';

const BookStyled = styled(Book)<{ variant?: 'up' | 'down' }>`
  width: 100%;
  color: var(--main-black);
  transform: ${(props) =>
    props.variant === 'down' && 'rotate(180deg) translate(0, 1.5%)'};
`;

interface BookWormProps {
  readonly className?: string;
}

const BookWormUnstyled = (props: BookWormProps): React.ReactElement => (
  <div className={props.className}>
    <BookStyled variant='up' />
    <BookStyled variant='down' />
    <BookStyled variant='up' />
    <BookStyled variant='down' />
    <BookStyled variant='up' />
  </div>
);

/**
 *
 * @param variant вариант исполнения компонента. Влияет на раскраску "книжек"
 * червя при анимации. Может принимать значения: 'red' или 'black'. Значение
 * не обязательное.
 * @returns компонент BookWorm, представляет из себя анимированный flexbox
 * контейнер с svg картинками "книжек". Используется для индикации загрузки
 * или как бесконечный progress bar. 5 книжек расположены слева направло
 * "червяком" и по очереди меняют цвет. Есть 3 варианта раскраски:
 *  1. с прозрачного цвета на белый. Это вариант по умолчанию. Он сработает
 * если не указывать никакого значения в свойстве variant данного компонента
 * 2. с чёрного на белый. Этот вариант сработает, если указать в свойстве variant
 * компонента значение "black"
 * 3. с красного на белый. Этот вариант сработает, если указать в свойстве variant
 * компонента значение "red"
 * Компонент имеет пропорции 5*sqrt(3) / 1 (пять корней из трёх к одному) и
 * масштабируется относительно ширины страницы, с предельной шириной
 *
 */

const BookWorm = styled(BookWormUnstyled)<{
  variant?: 'red' | 'black';
  size?: string;
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: ${(props) => (props.size ? props.size : '80vw')};
  aspect-ratio: calc(5 * sqrt(3) / 2);
  max-width: 620px;
  gap: 1%;

  --delay-unit: 0.5s;

  svg {
    animation: pulse calc(var(--delay-unit) * 10) infinite;
  }

  --animation-color: ${(props) =>
      props.variant === 'red' && 'var(--main-red-100)'}
    ${(props) => props.variant === 'black' && 'var(--main-black)'}
    ${(props) => !props.variant && 'rgba(0,0,0,0)'};

  @keyframes pulse {
    0% {
      color: white;
    }
    49% {
      color: white;
    }
    50% {
      color: var(--animation-color);
    }
    100% {
      color: var(--animation-color);
    }
  }

  svg:nth-child(2) {
    animation-delay: var(--delay-unit);
  }

  svg:nth-child(3) {
    animation-delay: calc(var(--delay-unit) * 2);
  }

  svg:nth-child(4) {
    animation-delay: calc(var(--delay-unit) * 3);
  }

  svg:nth-child(5) {
    animation-delay: calc(var(--delay-unit) * 4);
  }
`;

export default BookWorm;
