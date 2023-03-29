// TODO удалить ненужный компонент

import React, {
  PropsWithChildren,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  AnimatePresence,
  AnimateSharedLayout,
  motion,
  wrap,
} from 'framer-motion';
import styled, { StyledComponent } from 'styled-components';
import Image from 'next/image';
import books from '@/mocks/books';
import useScreenSize from '@/hooks/useScreenSize';
// import {
//   DotWrapper,
//   PaginationContainer,
//   PaginationDot,
// Slide,
//   SliderContainer,
// } from './styles';
// import Text from '../Common/Text';
// import Button from '../Common/Button';
// import breakPoints from '@/utils/breakPoints';

// const variants = {
//   enter: (direction: number) => {
//     return {
//       x: direction > 0 ? window.innerWidth : -window.innerWidth,
//     };
//   },
//   center: {
//     x: 0,
//   },
//   exit: (direction: number) => {
//     return {
//       x: direction < 0 ? window.innerWidth : -window.innerWidth,
//     };
//   },
// };

// const swipeConfidenceThreshold = 10000;
// const swipePower = (offset: number, velocity: number) => {
//   return Math.abs(offset) * velocity;
// };

// const BannerContainer = styled.div`
//   display: flex;
//   flex-direction: row;
//   padding: 60px 32px 24px;
//   gap: 96px;
//   width: 100%;
//   justify-content: center;
//   @media ${breakPoints.md} {
//     gap: 40px;
//   }
//   @media ${breakPoints.sm} {
//     flex-direction: column;
//     align-items: center;
//     gap: 24px;
//     padding: 32px 32px 24px;
//   }
// `;

// const BannerDescription = styled.div`
//   display: flex;
//   flex-direction: column;
//   justify-content: center;
//   gap: 32px;
//   max-width: 688px;
//   width: 100%;
//   @media ${breakPoints.lg} {
//     gap: 16px;
//   }
//   @media ${breakPoints.sm} {
//     gap: 8px;
//     align-items: center;
//   }
// `;

// const BannerInfo = styled.div`
//   display: flex;
//   flex-direction: column;
//   justify-content: space-around;
//   @media ${breakPoints.sm} {
//     align-items: center;
//     gap: 24px;
//   }
// `;

// const BannerCover = styled(Image)`
//   pointer-events: none;
//   width: clamp(150px, 20vmax, 420px);
//   height: auto;
//   object-fit: contain;
// `;

// const Title = styled(Text)`
//   font-size: clamp(24px, 5vw, 70px);
//   width: 100%;
//   @media ${breakPoints.sm} {
//     text-align: center;
//   }
// `;

// const Author = styled(Text)`
//   font-size: clamp(12px, 3vw, 40px);
//   @media ${breakPoints.sm} {
//     text-align: center;
//   }
// `;

// const Thesis = styled(Text)`
//   opacity: 0.6;
//   font-size: clamp(10px, 2.5vw, 24px);
//   font-style: italic;
//   text-transform: uppercase;
//   @media ${breakPoints.sm} {
//     text-align: center;
//   }
// `;

// const BannerButton = styled(Button)`
//   @media ${breakPoints.md} {
//     min-height: 48px;
//   }
// `;

// function Banner({ index }: { index: number }) {
//   return (
//     <BannerContainer>
//       <BannerCover
//         height={670}
//         width={420}
//         src={books[index].cover}
//         alt={books[index].title}
//       />
//       <BannerInfo>
//         <BannerDescription>
//           <Title variant='h2_1'>{books[index].title}</Title>
//           <Author variant='h2_2'>
//             {books[index].authors.map((author) => author.name).join(', ')}
//           </Author>
//           <Thesis>{books[index].thesis}</Thesis>
//         </BannerDescription>
//         <BannerButton>Познать</BannerButton>
//       </BannerInfo>
//     </BannerContainer>
//   );
// }

// function Pagination({ index }: { index: number }) {
//   return (
//     <PaginationContainer>
//       {books.map((book, idx) => (
//         <DotWrapper>
//           <PaginationDot
//             key={book.id}
//             className={idx === index ? 'active' : ''}
//             type='button'
//             aria-label='pagination-button'
//           />
//         </DotWrapper>
//       ))}
//     </PaginationContainer>
//   );
// }

// type Callback<T> = (arg: T) => void;

// function ifPageHasFocus<T extends unknown>(callback: Callback<T>, arg: T) {
//   if (document?.hasFocus()) {
//     callback(arg);
//   }
// }

// export default function Slider() {
//   const [[page, direction], setPage] = useState([0, 0]);
//   const bookIndex = wrap(0, books.length, page);

//   const paginate = (newDirection: number) => {
//     setPage([page + newDirection, newDirection]);
//   };

//   const handlePaginate = useCallback(() => {
//     ifPageHasFocus<number>(paginate, 1);
//   }, [page]);

//   useEffect(() => {
//     const autoSlide = setInterval(handlePaginate, 5000);
//     return () => {
//       clearInterval(autoSlide);
//     };
//   }, [page]);

//   return (
//     <SliderContainer>
//       <AnimatePresence initial={false} custom={direction}>
//         <Slide
//           as={motion.div}
//           key={page}
//           custom={direction}
//           variants={variants}
//           initial='enter'
//           animate='center'
//           exit='exit'
//           transition={{
//             x: { duration: 1 },
//           }}
//           drag='x'
//           dragConstraints={{ left: 0, right: 0 }}
//           dragElastic={1}
//           onDragEnd={(
//             _: MouseEvent | TouchEvent | PointerEvent,
//             {
//               offset,
//               velocity,
//             }: { offset: { x: number }; velocity: { x: number } }
//           ) => {
//             const swipe = swipePower(offset.x, velocity.x);

//             if (swipe < -swipeConfidenceThreshold) {
//               paginate(1);
//             } else if (swipe > swipeConfidenceThreshold) {
//               paginate(-1);
//             }
//           }}
//         >
//           <Banner index={bookIndex} />
//         </Slide>
//       </AnimatePresence>
//       <Pagination index={bookIndex} />
//     </SliderContainer>
//   );
// }

const StyledBannerContainer = styled.div`
  padding: 32px;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 1440px;
  justify-content: space-around;
  width: 100%;
  gap: 64px;
  z-index: 1;
  @media screen and (max-width: 512px) {
    flex-direction: column;
    gap: 0px;
  }
`;

const StyledCover = styled(Image)`
  max-width: 420px;
  width: 100%;
  object-fit: contain;
  @media screen and (max-width: 1024px) {
    max-width: 300px;
  }
  @media screen and (max-width: 768px) {
    max-width: 250px;
  }
  @media screen and (max-width: 512px) {
    /* display: none; */
    max-width: 200px;
  }
  @media screen and (max-width: 375px) {
    max-width: 150px;
  }
`;

function Slide({ currentPage }: { currentPage: number }) {
  return (
    <StyledBannerContainer>
      <StyledCover
        width={420}
        height={670}
        draggable='false'
        src={books[currentPage].cover}
        alt={books[currentPage].title}
      />
      {/* <StyledInfo>
        <StyledTitle variant='heading' tag='h1'>
          {books[currentPage].title}
        </StyledTitle>
        <StyledAuthor variant='heading' tag='h2'>
          {books[currentPage].authors.map((author) => author.name).join(', ')}
        </StyledAuthor>
        <StyledThesis variant='caption'>
          {books[currentPage].thesis}
        </StyledThesis>
        <StyledButton type='button'>Познать</StyledButton>
      </StyledInfo> */}
    </StyledBannerContainer>
  );
}

const xOffset = 100;
const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? xOffset : -xOffset,
    opacity: 0,
    transition: { bounce: 0 },
  }),
  active: {
    x: 0,
    opacity: 1,
    transition: { bounce: 0, ease: 'easeInOut', delay: 0.5 },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -xOffset : xOffset,
    opacity: 0,
    transition: { bounce: 0 },
  }),
};

const StyledSliderContainer = styled.section<{ height: number }>`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  width: 100%;
  height: 80vh;
  overflow-x: hidden;
  background-color: #050505;
  @media screen and (max-width: 512px) {
    height: 80vh;
  }
`;

const StyledSlide = styled(motion.div)`
  display: flex;
  justify-content: center;
  /* align-items: center; */
  align-items: center;
  border-radius: 5px;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`;

type SlidesProps = {
  currentPage: number;
  setPage: (a: number, b?: number) => void;
  direction: number;
};

function Slides({ currentPage, setPage, direction }: SlidesProps) {
  const [, height] = useScreenSize();

  const detectPaginationGesture = (
    e: DragEvent,
    { offset }: { offset: { x: number; y: number } }
  ) => {
    let newPage = currentPage;
    const threshold = xOffset / 2;

    if (offset.x < -threshold) {
      newPage = currentPage + 1;
    } else if (offset.x > threshold) {
      newPage = currentPage - 1;
    }

    if (newPage !== currentPage) {
      newPage = wrap(0, pages.length, newPage);
      setPage(newPage, offset.x < 0 ? 1 : -1);
    }
  };

  return (
    <StyledSliderContainer height={height}>
      <AnimatePresence initial={false} custom={direction}>
        <StyledSlide
          key={currentPage}
          variants={variants}
          initial='enter'
          animate='active'
          exit='exit'
          drag='x'
          dragMomentum={false}
          onDragEnd={detectPaginationGesture}
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          custom={direction}
        >
          <Slide currentPage={currentPage} />
        </StyledSlide>
      </AnimatePresence>
      <Pagination currentPage={currentPage} setPage={setPage} />
    </StyledSliderContainer>
  );
}

const StyledDots = styled.div`
  display: flex;
  justify-content: center;
`;

function Pagination({
  currentPage,
  setPage,
}: {
  currentPage: number;
  setPage: (n: number) => void;
}) {
  return (
    <AnimateSharedLayout>
      <StyledDots>
        {books.map((book, idx) => (
          <Dot
            key={book.id}
            onClick={() => setPage(idx)}
            isSelected={idx === currentPage}
          />
        ))}
      </StyledDots>
    </AnimateSharedLayout>
  );
}

const StyledDotContainer = styled.button`
  background-color: transparent;
  padding: 20px;
  cursor: pointer;
`;

const StyledDot = styled.div`
  width: 10px;
  height: 10px;
  background: white;
  border-radius: 50%;
  position: relative;
`;

const StyledDotHighlight = styled(motion.div)`
  background: #930000;
  border-radius: 50%;
  width: 14px;
  height: 14px;
  position: absolute;
  top: -2px;
  left: -2px;
`;

function Dot({
  isSelected,
  onClick,
}: {
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <StyledDotContainer onClick={onClick}>
      <StyledDot>
        {isSelected && <StyledDotHighlight layoutId='highlight' />}
      </StyledDot>
    </StyledDotContainer>
  );
}

const pages = [
  {
    id: 1,
    cover:
      'https://images.unsplash.com/photo-1661956600655-e772b2b97db4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=735&q=80',
    title: 'Mailchimp',
  },
  {
    id: 2,
    cover:
      'https://images.unsplash.com/photo-1679423137857-f326e886bdf6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1529&q=80',
    title: 'Горы',
  },
  {
    id: 3,
    cover:
      'https://images.unsplash.com/photo-1679072644862-f0db0d92f4f9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=765&q=80',
    title: 'Венеция',
  },
];

type Callback<T> = (arg: T) => void;

function ifPageHasFocus<T extends unknown>(callback: Callback<T>, arg: T) {
  if (document?.hasFocus()) {
    callback(arg);
  }
}

export default function Slider(): ReactElement {
  const [[currentPage, direction], setCurrentPage] = useState([0, 0]);

  const setPage = (newPage: number, newDirection?: number) => {
    if (!newDirection) newDirection = newPage - currentPage;
    setCurrentPage([newPage, newDirection]);
  };

  const paginate = (newDirection: number) => {
    setPage(wrap(0, pages.length, currentPage + newDirection));
  };

  const handlePaginate = useCallback(() => {
    /**
     * Пагинация срабатывает только если страница в фокусе.
     * Если не исользовать, то при переключении на другую вкладку
     * браузер будет копить анимации в microtask-queue
     * и, когда фокус вернётся на страницу, начнёт их выполнять,
     * но уже без задержки. Это приведёт к очень быстрой смене слайдов
     */
    ifPageHasFocus<number>(paginate, 1);
  }, [currentPage]);

  useEffect(() => {
    const autoSlide = setInterval(handlePaginate, 5000);
    return () => {
      clearInterval(autoSlide);
    };
  }, [currentPage]);

  return (
    <>
      <Slides
        currentPage={currentPage}
        direction={direction}
        setPage={setPage}
      />
    </>
  );
}
