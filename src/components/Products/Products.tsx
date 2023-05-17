import { motion, AnimatePresence } from 'framer-motion';
import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  KeyboardEvent as ReactKeyEvent,
  ReactElement,
  // RefObject,
} from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import ProductCard from '../ProductCard';
import {
  GridContainer,
  Preview,
  RowContainer,
  RowItem,
  CloseButton,
  Title,
  Author,
  Slogan,
  Description,
  Container,
  DescriptionBox,
  Button,
} from './styles';
import CloseIcon from '@/assets/icons/cross.svg';
import { Book } from '@/models/books';
import splitByRows from '@/utils/splitByRows';
import useScreenSize from '@/hooks/useScreenSize';
import useScrollTo from '@/hooks/useScrollTo';

const VideoContainer = styled.div`
  display: flex;
  position: relative;
  width: 60vw;
  min-height: 100%;
  overflow: hidden;
  background-image: linear-gradient(
    90deg,
    rgba(05, 05, 05, 1) 0%,
    rgba(05, 05, 05, 0) 20%
  );
  background-blend-mode: overlay;
  @media screen and (max-width: 1024px) {
    width: 100%;
    min-height: 50vh;
    background-image: linear-gradient(
      0deg,
      rgba(05, 05, 05, 1) 0%,
      rgba(05, 05, 05, 0) 20%,
      rgba(05, 05, 05, 0) 80%,
      rgba(05, 05, 05, 1) 100%
    );
  }
`;

const Video = styled.video`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-height: 100%;
  z-index: -2;
  object-fit: cover;
`;

const BookDescriptionContainer = styled(Container)`
  display: grid;
  grid-template-areas:
    'info info info'
    'description description description'
    'button . .';
  width: 60vw;
  max-width: 80ch;
  padding: 5vh 1vw 5vh 10vw;
  @media screen and (max-width: 1024px) {
    max-width: 100%;
    width: 100%;
    grid-template-columns: 250px 1fr 1fr;
    grid-template-areas:
      'info  description description'
      'button  description description';
    padding-left: 5vw;
    column-gap: 5vw;
  }
`;

const InfoContainer = styled(Container)`
  grid-area: info;
`;

const MotionPreview = styled(motion.div)`
  display: flex;
  @media screen and (max-width: 1024px) {
    flex-direction: column-reverse;
  }
`;

interface RowProps {
  row: Book[];
  data: Book[];
  buttonStyle: 'outlined' | 'filled';
}

function Row({ row, data, buttonStyle }: RowProps) {
  const [preview, setPreview] = useState<Book>();
  const [isOpen, setIsOpen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [width] = useScreenSize();
  const router = useRouter();
  const REDIRECT_ON_CLICK_DISPLAY_WIDTH = 768;

  const open = (id: number) => {
    if (width <= REDIRECT_ON_CLICK_DISPLAY_WIDTH) {
      const bookItem = data.find((book) => book.id === id);
      return router.push(`/books/${bookItem?.transliteratedTitle}`);
    }
    if (isOpen && id === preview?.id) {
      setIsOpen(false);
    } else {
      setPreview(data.find((book) => book.id === id));
      setIsOpen(true);
    }
  };

  const close = () => {
    setIsOpen(false);
  };

  const onEnterKey = (event: ReactKeyEvent) => {
    if (preview && event.key === 'Enter') {
      open(preview.id);
    }
  };

  useScrollTo(previewRef.current, isOpen, 300);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (isOpen && event.key === 'Escape') {
        close();
      }
    };
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);
  return (
    <RowItem>
      <RowContainer>
        {row.map((props) => (
          <ProductCard
            key={props.id}
            onEnterKey={onEnterKey}
            onClick={() => open(props.id)}
            buttonStyle={buttonStyle}
            {...props}
          />
        ))}
      </RowContainer>
      <div ref={previewRef}>
        <AnimatePresence>
          {isOpen && preview && width > 512 && (
            <Preview
              style={{ overflowX: 'hidden', overflowY: 'hidden' }}
              className={isOpen ? 'visible' : 'hidden'}
              width={document.body.clientWidth}
            >
              <MotionPreview
                initial={{
                  opacity: 0,
                  height: 0,
                }}
                animate={{
                  opacity: 1,
                  height: 'auto',
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <BookDescriptionContainer gap={32}>
                  <InfoContainer gap={12}>
                    <Title>{preview.title}</Title>
                    <Author>
                      {preview.authors.map((author) => author.name).join(', ')}
                    </Author>
                    <Slogan>{preview.thesis}</Slogan>
                  </InfoContainer>
                  <DescriptionBox>
                    <Description>
                      {/* TODO убрать повторение перед релизом */}
                      {preview.description}
                      {preview.description}
                      {preview.description}
                    </Description>
                  </DescriptionBox>
                  <Button variant='outlined' onClick={() => undefined}>
                    Познать
                  </Button>
                </BookDescriptionContainer>
                <VideoContainer ref={videoContainerRef}>
                  <Video autoPlay muted loop>
                    <source src='video/composition-v2.mp4' />
                  </Video>
                </VideoContainer>
                <CloseButton onClick={close} type='button'>
                  <CloseIcon />
                </CloseButton>
              </MotionPreview>
            </Preview>
          )}
        </AnimatePresence>
      </div>
    </RowItem>
  );
}

interface GridProps {
  data: Book[];
}

const getColumns = (width: number) => {
  if (width <= 512) {
    return 1;
  }
  if (width < 1024) {
    return 2;
  }
  return 3;
};

const Select = styled.select`
  width: 200px;
  padding: 10px;
  border-radius: 4px;
`;

export default function Products({ data }: GridProps): ReactElement {
  const [width] = useScreenSize();
  const inRow = useMemo(() => getColumns(width), [width]);
  const books = useMemo(() => splitByRows(data, inRow), [data, inRow]);
  const [buttonStyle, setButtonStyle] = useState<'outlined' | 'filled'>(
    'outlined'
  );
  return (
    <GridContainer>
      <label htmlFor='select-style'>Варианты кнопок:</label>
      {/* TODO @sergromm: удалить выбор стилей после того как решится что делать с кнопками */}
      <Select
        onChange={(e) => {
          const value = e.currentTarget.value as 'outlined' | 'filled';
          setButtonStyle(value);
        }}
        name='styles'
        id='select-style'
      >
        <option value='outlined'>C обводкой</option>
        <option value='filled'>Цветные</option>
      </Select>
      {books.map((arr, idx) => (
        <Row
          buttonStyle={buttonStyle}
          key={`${arr.toString()}+${idx + 1}`}
          row={arr}
          data={data}
        />
      ))}
    </GridContainer>
  );
}
