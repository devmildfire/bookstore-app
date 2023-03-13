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
import breakPoints from '@/utils/breakPoints';

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
  flex-direction: row;
  padding: 60px 32px 24px;
  gap: 96px;
  width: 100%;
  justify-content: center;
  @media ${breakPoints.md} {
    gap: 40px;
  }
  @media ${breakPoints.sm} {
    flex-direction: column;
    align-items: center;
    gap: 24px;
    padding: 32px 32px 24px;
  }
`;

const BannerDescription = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 32px;
  max-width: 688px;
  width: 100%;
  @media ${breakPoints.lg} {
    gap: 16px;
  }
  @media ${breakPoints.sm} {
    gap: 8px;
    align-items: center;
  }
`;

const BannerInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  @media ${breakPoints.sm} {
    align-items: center;
    gap: 24px;
  }
`;

const BannerCover = styled(Image)`
  pointer-events: none;
  width: clamp(150px, 30vmax, 420px);
  height: auto;
  object-fit: contain;
`;

const Title = styled(Text)`
  font-size: clamp(24px, 5vw, 70px);
  width: 100%;
  @media ${breakPoints.sm} {
    text-align: center;
  }
`;

const Author = styled(Text)`
  font-size: clamp(12px, 3vw, 40px);
  @media ${breakPoints.sm} {
    text-align: center;
  }
`;

const Thesis = styled(Text)`
  opacity: 0.6;
  font-size: clamp(10px, 2.5vw, 24px);
  font-style: italic;
  text-transform: uppercase;
  @media ${breakPoints.sm} {
    text-align: center;
  }
`;

const BannerButton = styled(Button)`
  @media ${breakPoints.md} {
    min-height: 48px;
  }
`;

function Banner({ index }: { index: number }) {
  return (
    <BannerContainer>
      <BannerCover
        height={670}
        width={420}
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
        <BannerButton>Познать</BannerButton>
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
          onDragEnd={(
            _: MouseEvent | TouchEvent | PointerEvent,
            {
              offset,
              velocity,
            }: { offset: { x: number }; velocity: { x: number } }
          ) => {
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
