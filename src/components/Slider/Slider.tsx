import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, wrap } from 'framer-motion';
import styled from 'styled-components';
import Image from 'next/image';
import books from '@/mocks/books';
import {
  DotWrapper,
  PaginationContainer,
  PaginationDot,
  Slide,
  SliderContainer,
} from './styles';
import Text from '../Common/Text';
import Button from '../Common/Button';

const variants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? window.innerWidth : -window.innerWidth,
    };
  },
  center: {
    x: 0,
  },
  exit: (direction: number) => {
    return {
      x: direction < 0 ? window.innerWidth : -window.innerWidth,
    };
  },
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

const BannerContainer = styled.div`
  display: flex;
  padding: 60px 0 24px;
  gap: 96px;
  height: 100%;
  width: 100%;
  justify-content: center;
`;

const BannerDescription = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2rem;
  max-width: 688px;
  width: 100%;
`;

const BannerInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  height: 100%;
`;

const BannerCover = styled(Image)`
  pointer-events: none;
  width: auto;
  height: auto;
`;

const Title = styled(Text)`
  font-size: 70px;
`;

const Author = styled(Text)`
  font-size: 40px;
`;

const Thesis = styled(Text)`
  opacity: 0.6;
  font-size: 24px;
  font-style: italic;
  text-transform: uppercase;
`;

function Banner({ index }: { index: number }) {
  return (
    <BannerContainer>
      <BannerCover
        height={670}
        width={457}
        src={books[index].cover}
        alt={books[index].title}
      />
      <BannerInfo>
        <BannerDescription>
          <Title variant='h2_1'>{books[index].title}</Title>
          <Author variant='h2_2'>
            {books[index].authors.map((author) => author.name).join(', ')}
          </Author>
          <Thesis>{books[index].thesis}</Thesis>
        </BannerDescription>
        <Button>Познать</Button>
      </BannerInfo>
    </BannerContainer>
  );
}

function Pagination({ index }: { index: number }) {
  return (
    <PaginationContainer>
      {books.map((book, idx) => (
        <DotWrapper>
          <PaginationDot
            key={book.id}
            className={idx === index ? 'active' : ''}
            type='button'
            aria-label='pagination-button'
          />
        </DotWrapper>
      ))}
    </PaginationContainer>
  );
}

const ifPageHasFocus = <T extends unknown>(
  callback: (arg: T) => void,
  arg: T
) => {
  if (document?.hasFocus()) {
    callback(arg);
  }
};

export default function Slider() {
  const [[page, direction], setPage] = useState([0, 0]);
  const bookIndex = wrap(0, books.length, page);

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  const handlePaginate = useCallback(() => {
    ifPageHasFocus<number>(paginate, 1);
  }, [page]);

  useEffect(() => {
    const autoSlide = setInterval(handlePaginate, 5000);
    return () => {
      clearInterval(autoSlide);
    };
  }, [page]);

  return (
    <SliderContainer>
      <AnimatePresence initial={false} custom={direction}>
        <Slide
          as={motion.div}
          key={page}
          custom={direction}
          variants={variants}
          initial='enter'
          animate='center'
          exit='exit'
          transition={{
            x: { duration: 1 },
          }}
          drag='x'
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);

            if (swipe < -swipeConfidenceThreshold) {
              paginate(1);
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1);
            }
          }}
        >
          <Banner index={bookIndex} />
        </Slide>
      </AnimatePresence>
      <Pagination index={bookIndex} />
    </SliderContainer>
  );
}
