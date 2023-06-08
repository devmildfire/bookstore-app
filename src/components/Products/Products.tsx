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
  PreviewContainer,
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
import { TriggerStyles } from '../Common/Trigger/Trigger';
import ProductCard3d from '../ProductCard/ProductCard3d';

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
  height: 100%;
  align-content: space-between;
  /* max-height: 565px; */
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
  buttonStyle: TriggerStyles;
  bookStyle: '3d' | 'flat';
  rowId: number;
  openRowId: number | undefined;
  handleOpenRow: (id: number) => void;
}

type PreviwProps = {
  isOpen: boolean;
  shouldClose: boolean;
  preview?: Book;
  width: number;
  handleClose: () => void;
  videoContainerRef: React.Ref<HTMLDivElement>;
};

function Preview({
  isOpen,
  shouldClose,
  preview,
  width,
  videoContainerRef,
  handleClose,
}: PreviwProps) {
  const router = useRouter();
  return (
    <AnimatePresence>
      {!shouldClose && preview && isOpen && width > 512 && (
        <PreviewContainer
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
              height: '60vh',
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
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
                </Description>
              </DescriptionBox>
              <Button
                variant='outlined'
                onClick={() => router.push(`/books/deleted`)}
              >
                Познать
              </Button>
            </BookDescriptionContainer>
            <VideoContainer ref={videoContainerRef}>
              <Video autoPlay muted loop>
                <source src='video/composition-v2.mp4' />
              </Video>
            </VideoContainer>
            <CloseButton onClick={handleClose} type='button'>
              <CloseIcon />
            </CloseButton>
          </MotionPreview>
        </PreviewContainer>
      )}
    </AnimatePresence>
  );
}

function Row({
  row,
  data,
  buttonStyle,
  bookStyle,
  rowId,
  openRowId,
  handleOpenRow,
}: RowProps) {
  const [preview, setPreview] = useState<Book>();
  const [shouldClose, setShouldClose] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [width] = useScreenSize();
  const router = useRouter();
  const REDIRECT_ON_CLICK_DISPLAY_WIDTH = 768;
  const isOpen = openRowId === rowId;

  const open = (id: number) => {
    if (width <= REDIRECT_ON_CLICK_DISPLAY_WIDTH) {
      const bookItem = data.find((book) => book.id === id);
      return router.push(`/books/${bookItem?.transliteratedTitle}`);
    }

    const newPreview = data.find((book) => book.id === id);

    setShouldClose(false);
    handleOpenRow(rowId);
    setPreview(newPreview);
    // }
  };

  const close = () => {
    setShouldClose(true);
  };

  const onEnterKey = (event: ReactKeyEvent) => {
    if (preview && event.key === 'Enter') {
      open(preview.id);
    }
  };

  useScrollTo(previewRef.current, isOpen, 400);

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
        {row.map((props) =>
          bookStyle === '3d' ? (
            <ProductCard3d
              key={props.id}
              onEnterKey={onEnterKey}
              onClick={() => open(props.id)}
              buttonStyle={buttonStyle}
              {...props}
            />
          ) : (
            <ProductCard
              key={props.id}
              onEnterKey={onEnterKey}
              onClick={() => open(props.id)}
              buttonStyle={buttonStyle}
              {...props}
            />
          )
        )}
      </RowContainer>
      <div ref={previewRef}>
        <Preview
          isOpen={isOpen}
          shouldClose={shouldClose}
          preview={preview}
          videoContainerRef={videoContainerRef}
          width={width}
          handleClose={close}
        />
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

export default function Products({ data }: GridProps): ReactElement {
  const [width] = useScreenSize();
  const inRow = useMemo(() => getColumns(width), [width]);
  const books = useMemo(() => splitByRows(data, inRow), [data, inRow]);
  const [openRowId, setOpenRowId] = useState<number>();

  function handleOpenPreview(id: number) {
    setOpenRowId(id);
  }

  return (
    <GridContainer>
      {/* TODO @sergromm: удалить выбор стилей после того как решится что делать с кнопками */}
      {/* <Leva /> */}

      {books.map((arr, idx) => (
        <Row
          buttonStyle='outlined'
          bookStyle='3d'
          key={`${arr.toString()}+${idx + 1}`}
          row={arr}
          handleOpenRow={handleOpenPreview}
          openRowId={openRowId}
          rowId={idx}
          data={data}
        />
      ))}
    </GridContainer>
  );
}
